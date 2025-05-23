import express from "express";
import { exec, spawn } from "child_process";
import { Server } from "socket.io";
import fs from "fs/promises";
import cors from "cors";
import http from "http";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import os from "os";
import { buffer } from "stream/consumers";
import { SerialPort } from "serialport";
import sequelize from "./models/db.js";
import dotenv from "dotenv";
import setupAssociations from "./models/associations.js";
import History from "./models/userHistory.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    setupAssociations();

    await sequelize.sync({ alter: true });
    console.log("🔄 Database synchronized");

    const { Role } = sequelize.models;
    await Role.findOrCreate({ where: { role_label: "student" } });
    await Role.findOrCreate({ where: { role_label: "teacher" } });
  } catch (error) {
    console.error(" Database initialization failed:", error);
    throw error;
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRECT_KEY,
});
const serial = new SerialPort({
  path: "COM5",
  baudRate: 9600,
  autoOpen: false,
});

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors({ origin: "*" }));

const io = new Server(server, {
  cors: { origin: "*" },
  pingInterval: 10000,
  pingTimeout: 30000,
});
io.use((socket,next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    socket.emit('redirect', { url: 'localhost:5000/login' });
    return next(new Error("Authentication error"));
    
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        socket.emit('redirect', { url: 'localhost:5000/login' });
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;
    next();
  });
});

// -------------------- Variables ---------------------
const clients = {};
let waitlist = [];
let currentClient = null;
let controlTimer = null;
let errorCounts = [];

// -------------------- Video Capture ---------------------
const ffmpeg = spawn("ffmpeg", [
  "-f",
  "dshow",
  "-i",
  "video=HD User Facing",
  "-vf",
  "scale=640:480,hflip",
  "-r",
  "30",
  "-q:v",
  "4",
  "-preset",
  "ultrafast",
  "-tune",
  "zerolatency",
  "-fflags",
  "nobuffer",
  "-flush_packets",
  "1",
  "-f",
  "mjpeg",
  "pipe:1",
]);
let latestframe = null;
let frameBuffer = Buffer.alloc(0);
const JPEG_HEADER = Buffer.from([0xff, 0xd8]);
const JPEG_FOOTER = Buffer.from([0xff, 0xd9]);
//-----------------------functions---------------------
const uploadFile = async (filePath) => {
  try {
    if (!filePath) {
      const error = new Error("File does not exist");
      error.statusCode = 404;
      throw error;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      eager_async: false,
    });
    console.log(result);

    return result.secure_url;
  } catch (err) {
    console.error(err);
    const error = new Error(err.message || "Image upload failed");
    error.statusCode = err.statusCode || 400;
    throw error;
  }
};

async function flashArduino({ hexbase64, clientId }) {
  try {
    const hexBuffer = Buffer.from(hexbase64, "base64");

    const hexDir = path.join(os.tmpdir(), "sketch");
    await fs.mkdir(hexDir, { recursive: true });
    const hexFilePath = path.join(hexDir, "sketch.ino.hex");
    await fs.writeFile(hexFilePath, hexBuffer);
    io.to(clients[clientId]).emit("log", " Flashing...");

    const avrdudeCmd = process.env.ARDUINO_FLASH_COMMAND;

    const avrdudeArgs = [
      "-C",
      process.env.ARDUINO_FLASH_ARGS_COMMAND,
      "-v",
      "-p",
      "m328p",
      "-c",
      "arduino",
      "-P",
      "COM5",
      "-b",
      "115200",
      "-D",
      "-U",
      `flash:w:${hexFilePath}:i`,
    ];

    const flash = spawn(avrdudeCmd, avrdudeArgs);

    flash.stdout.on("data", (data) => {
      io.to(clients[clientId]).emit("log", data.toString());
    });

    flash.stderr.on("data", (data) => {
      io.to(clients[clientId]).emit("log", data.toString());
    });

    flash.on("close", async (code) => {
      if (code === 0) {
        serial.open();
        await fs.rm(hexDir, { recursive: true, force: true });
        io.to(clients[clientId]).emit("flash-success", "Flash successful.");
      } else {
        io.to(clients[clientId]).emit("flash-fail", "Flash failed.");
        await fs.rm(hexDir, { recursive: true, force: true });
      }
    });
  } catch (error) {
    console.error(error);
    io.to(clients[clientId]).emit("flash-fail", "Server error during flash.");
  }
}

ffmpeg.stdout.on("data", (chunk) => {
  frameBuffer = Buffer.concat([frameBuffer, chunk]);
  while (true) {
    const start = frameBuffer.indexOf(JPEG_HEADER);
    const end = frameBuffer.indexOf(JPEG_FOOTER, start);
    if (start === -1 || end === -1) break;

    const frame = frameBuffer.slice(start, end + 2);
    latestframe = frame.toString("base64");
    io.emit("video-frame", frame.toString("base64"));
    frameBuffer = frameBuffer.slice(end + 2);
  }
});

// ffmpeg.stderr.on("data", (data) => {
//     console.log("FFmpeg:", data.toString());
// });

// -------------------- Control Logic ---------------------
function startControlTimer() {
  controlTimer = setTimeout(() => {
    io.to(clients[currentClient]).emit("control-expired");
    delete clients[currentClient];
    currentClient = null;
    promoteNextClient();
  }, 2 * 60 * 1000);
}
function promoteNextClient() {
  if (currentClient) {
    clearTimeout(controlTimer);
    io.to(clients[currentClient]).emit("control-expired");
    currentClient = null;
  }

  if (errorCounts.length > 0) {
    const sortedClients = [...errorCounts].sort(
      (a, b) => a.errorcount - b.errorcount
    );

    for (const clientData of sortedClients) {
      const nextClient = clientData.clientId;
      const lowestErrorCount = clientData.errorcount;

      if (clients[nextClient]) {
        currentClient = nextClient;
        console.log(
          `Promoting client ${currentClient} with ${lowestErrorCount} errors`
        );

        io.to(clients[currentClient]).emit("control-granted", lowestErrorCount);
        startControlTimer();
        break;
      } else {
        console.log(
          `Client ${nextClient} not found in clients map, removing from errorCounts`
        );

        const index = errorCounts.findIndex((c) => c.clientId === nextClient);
        if (index !== -1) {
          errorCounts.splice(index, 1);
        }
      }
    }
  }
}

// -------------------- Socket Events ---------------------
io.on("connection", (socket) => {
  console.log("🔌 New client connected");

  if (latestframe) {
    socket.emit("video-frame", latestframe);
  }

  socket.on("register", (clientId) => {
    clients[clientId] = socket.id;
    errorCounts.push({ clientId, errorcount: 0 });
    console.log("Socket ID and Client ID:", socket.id, clientId);
    socket.join(clientId);
    if (!currentClient) {
      currentClient = clientId;
      io.to(clients[currentClient]).emit("control-granted");
      startControlTimer();
    } else {
      waitlist.push(clientId);
      io.to(socket.id).emit("queued");
    }
  });

  socket.on("disconnect", () => {
    const clientId = Object.keys(clients).find(
      (key) => clients[key] === socket.id
    );
    if (clientId) {
      console.log(`Client ${clientId} disconnected`);

      delete clients[clientId];

      const errorIndex = errorCounts.findIndex(
        (client) => client.clientId === clientId
      );
      if (errorIndex !== -1) {
        errorCounts.splice(errorIndex, 1);
        console.log(`Removed client ${clientId} from error counts`);
      }

      if (clientId === currentClient) {
        clearTimeout(controlTimer);
        currentClient = null;
        promoteNextClient();
      } else {
        waitlist = waitlist.filter((id) => id !== clientId);
      }
    }
    console.log(
      "Client disconnected, remaining clients:",
      Object.keys(clients).length
    );
  });

  socket.on("Error-Counts", ({ clientId, errorcount }) => {
    console.log("Received error count:", { clientId, errorcount });

    const clientIndex = errorCounts.findIndex(
      (client) => client.clientId === clientId
    );
    if (clientIndex !== -1) {
      errorCounts[clientIndex].errorcount = errorcount;
    } else {
      errorCounts.push({ clientId, errorcount });
    }

    console.log("Current error counts:", JSON.stringify(errorCounts));

    if (!currentClient) {
      promoteNextClient();
    } else if (clientId !== currentClient) {
      const sortedClients = [...errorCounts].sort(
        (a, b) => a.errorcount - b.errorcount
      );
      const lowestErrorClient = sortedClients[0]?.clientId;
      const lowestErrorCount = sortedClients[0]?.errorcount;

      if (lowestErrorClient && lowestErrorClient !== currentClient) {
        console.log(
          `Client ${lowestErrorClient} has lower errors (${lowestErrorCount}) than current client ${currentClient}`
        );
        promoteNextClient();
      }
    }
  });

  // -------------------- Compile ---------------------
  socket.on("compile-code", async ({ code, clientpath,clientId }) => {
    try {
      const tempDir = path.join(os.tmpdir(), clientpath);
      await fs.mkdir(tempDir, { recursive: true });
      const inoPath = path.join(tempDir, `${clientpath}.ino`);
      console.log("Writing code to:", inoPath);
      await fs.writeFile(inoPath, code);

      const inoUrl = await uploadFile(inoPath);

      console.log("Uploaded INO file to Cloudinary:", inoUrl);

      const compile = spawn(process.env.ARDUINO_CLI_COMMAND, [
        "compile",
        "--fqbn",
        "arduino:avr:nano",
        "--output-dir",
        tempDir,
        tempDir,
      ]);

      compile.stdout.on("data", (data) => {
        io.to(clients[clientId]).emit("log", data.toString());
      });

      compile.stderr.on("data", (data) => {
        io.to(clients[clientId]).emit("log", data.toString());
      });

      compile.on("close", async (code) => {
        if (code === 0) {
          const hexPath = path.join(tempDir, `${clientpath}.ino.hex`);
          const hexData = await fs.readFile(hexPath, "utf8");

          const hexUrl = await uploadFile(hexPath);
          console.log("Uploaded HEX file to Cloudinary:", hexUrl);
          const historyData = {
            user_history_id: clientId,
            user_id: socket.user.id,
            compilation_result: "success",
            ino_file_link: inoUrl,
            hex_file_link: hexUrl,
            action_timestamp: new Date(),
          };
          await History.upsert(historyData, {
            conflictFields: ["user_history_id"],
            updateOnDuplicate: [
              "compilation_result",
              "ino_file_link",
              "hex_file_link",
              "action_timestamp",
            ],
          });
          console.log("History entry created successfully");

          io.to(clients[clientId]).emit("compile-success", {
            hexBase64: hexData.toString("base64"),
            inoUrl,
            hexUrl,
          });
          await fs.rm(tempDir, { recursive: true, force: true });
        } else {
          const historyData = {
            user_history_id: clientId,
            user_id: socket.user.id,
            compilation_result: "failure",
            ino_file_link: inoUrl,
            hex_file_link: "not available",
            action_timestamp: new Date(),
          };
          await History.upsert(historyData, {
            conflictFields: ["user_history_id"],
            updateOnDuplicate: [
              "compilation_result",
              "ino_file_link",
              "hex_file_link",
              "action_timestamp",
            ],
          });

          io.to(clients[clientId]).emit("compile-fail", "Compilation error.");
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  // -------------------- Flash and Upload Hex ---------------------
  socket.on("flash-code", async ({ hexbase64, clientId }) => {
    try {
      await flashArduino({ hexbase64, clientId });
    } catch (error) {
      console.error(error);
      io.to(clients[clientId]).emit("flash-fail", "Server error during flash.");
    }
  });

  socket.on("reset-device", async (clientId) => {
    const hexPath = path.join(__dirname, "reset.hex");

    const hexData = await fs.readFile(hexPath);
    const base64Data = hexData.toString("base64");

    await flashArduino({ hexbase64: base64Data, clientId});
  });

  socket.on("test-device", async (clientId) => {
    const hexPath = path.join(__dirname, "test.hex");
    const hexData = await fs.readFile(hexPath, "utf8");
    const hexbase64 = hexData.toString("base64");
    await flashArduino({ hexbase64, clientId });
  });

  //---------------------Serial Monitor---------------------
  serial.on("open", () => {
    console.log("Serial port opened.");
  });
  socket.on("serial-command", ({ clientId, command }) => {
    console.log(`Sending to Arduino: ${command}`);

    serial.write(command.trim() + "\n", (err) => {
      if (err) {
        console.error("Error writing to serial:", err.message);
        io.to(clients[clientId]).emit("serial-error", err.message);
      }
    });
  });
  serial.on("data", (data) => {
    console.log("Arduino says:", data.toString());

    io.emit("serial-data", data.toString());
  });
});

// -------------------- Start ---------------------
const PORT = 4000;
server.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(` Lab Server running on port ${PORT}`);
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
});
