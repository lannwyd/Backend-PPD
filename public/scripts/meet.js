const socket = io("http://localhost:3000");
const peer = new Peer(undefined, {
  host: "localhost",
  port: 3000,
  path: "/peerjs",
});

const localVideo = document.getElementById("localVideo");
const screenShareVideo = document.getElementById("screenShareVideo");
const connectedUsers = document.getElementById("connectedUsers");
const messages = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const sendMessage = document.getElementById("sendMessage");
const endCallBtn = document.querySelector(".end-call");
const camBtn = document.querySelector(".cam");
const micBtn = document.querySelector(".mic");
const screenShareBtn = document.querySelector(".screen-share");
const onlineCount = document.getElementById("onlineCount");

let localStream;
let screenStream;
let screenShareCalls = {};
let isCamOn = true;
let isMicOn = true;
let isScreenSharing = false;
let isHost = false;
let userName = prompt("Enter your name");
const peers = {};
let clientID = Math.floor(Math.random() * 1000000);
const roomId = window.location.pathname.split("/").pop();

peer.on("open", (id) => {
  socket.emit("check-session-status", {
    sessionId: roomId,
    clientID: clientID,
  });
});

socket.on("session-status", (data) => {
  isHost = data.shouldBeHost;

  socket.emit("join-session", {
    sessionId: roomId,
    userName: userName,
    isHost: isHost,
    peerId: peer.id,
  });
});

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing media devices:", err);
  });

peer.on("call", (call) => {
  if (isAlreadyConnected(call.peer)) {
    call.close();
    return;
  }

  if (call.metadata && call.metadata.type === "screen-share") {
    const screenVideo = document.createElement("video");
    screenVideo.autoplay = true;
    screenVideo.playsInline = true;
    screenVideo.className = "screen-video";

    call.on("stream", (stream) => {
      screenVideo.srcObject = stream;
      screenShareVideo.innerHTML = "";
      screenShareVideo.appendChild(screenVideo);
      screenShareVideo.style.display = "block";
    });

    call.on("close", () => {
      screenVideo.remove();
      screenShareVideo.style.display = "none";
    });

    call.answer();
    return;
  }

  call.answer(localStream);
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;

  const container = document.createElement("div");
  container.className = "video-container peer";
  container.setAttribute("data-peer-id", call.peer);

  call.on("stream", (remoteStream) => {
    video.srcObject = remoteStream;
    container.appendChild(video);
    document.getElementById("videoGrid").appendChild(container);
    peers[call.peer] = { call, video, container };
  });

  call.on("close", () => {
    container.remove();
    delete peers[call.peer];
  });
});

socket.on("join-success", (data) => {
  isHost = data.isHost;

  updateHostUI();

  addUserCard(userName, peer.id, isHost);

  if (data.connectedUsers && data.connectedUsers.length > 0) {
    data.connectedUsers.forEach((user) => {
      if (user && user.peerId !== peer.id) {
        addUserCard(user.name, user.peerId, user.isHost);
      }
    });
  }
  updateOnlineCount();
});

socket.on("host-privileges", (hasPrivileges) => {
  isHost = hasPrivileges;
  updateHostUI();
});

socket.on("viewer-mode", (isViewer) => {
  isHost = !isViewer;
  updateHostUI();
});

function updateHostUI() {
  if (screenShareBtn) {
    screenShareBtn.style.display = isHost ? "block" : "none";
  }
}

function isAlreadyConnected(peerId) {
  return peers.hasOwnProperty(peerId);
}

socket.on("existing-peers", (peerList) => {
  peerList.forEach((peerInfo) => {
    if (peerInfo.peerId !== peer.id) {
      addUserCard(peerInfo.name, peerInfo.peerId, peerInfo.isHost);

      if (localStream) {
        connectToPeer(peerInfo.peerId, peerInfo.name);
      }
    }
  });
  updateOnlineCount();
});

socket.on("new-peer", (peerInfo) => {
 if (peerInfo.peerId !== peer.id) {
    addUserCard(peerInfo.name, peerInfo.peerId, peerInfo.isHost);
    
    if (localStream) {
      connectToPeer(peerInfo.peerId, peerInfo.name);
    }
    
   
    
    if (screenStream && isScreenSharing) {
      const screenCall = peer.call(peerInfo.peerId, screenStream, {
        metadata: { type: 'screen-share' }
      });
      
      screenShareCalls[peerInfo.peerId] = screenCall;
      screenCall.on('close', () => {
        delete screenShareCalls[peerInfo.peerId];
      });
    }
  }
  updateOnlineCount();
});

socket.on("peer-disconnected", (data) => {
  if (peers[data.peerId]) {
    peers[data.peerId].container.remove();
    peers[data.peerId].call.close();
    delete peers[data.peerId];
  }

  removeUserCard(data.peerId);
  updateOnlineCount();
  window.loca;
});

socket.on("users-updated", (users) => {
  updateUsersList(users);
  updateOnlineCount();
});

socket.on("new-message", ({ userName, message, timestamp }) => {
  addMessage(userName, message, timestamp);
});

socket.on("host-screen-share-started", ({ peerId, userName }) => {});

socket.on("host-screen-share-stopped", ({ peerId, userName }) => {
  screenShareVideo.innerHTML = "";
  screenShareVideo.style.display = "none";
});

socket.on("promoted-to-host", () => {
  isHost = true;
  updateHostUI();

  alert("You are now the host of this session");
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
  alert("Error: " + error);
});

function connectToPeer(peerId, peerName) {
  if (isAlreadyConnected(peerId)) {
    return;
  }

  const call = peer.call(peerId, localStream);
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;

  const container = document.createElement("div");
  container.className = "video-container peer";
  container.setAttribute("data-peer-id", peerId);

  call.on("stream", (remoteStream) => {
    video.srcObject = remoteStream;
    container.appendChild(video);
    document.getElementById("videoGrid").appendChild(container);
    peers[peerId] = { call, video, container };
  });

  call.on("close", () => {
    container.remove();
    delete peers[peerId];
  });
}

function addUserCard(userName, userId, isUserHost = false) {
  removeUserCard(userId);

  const userCard = document.createElement("div");
  userCard.className = "user-card";
  userCard.setAttribute("data-peer-id", userId);

  const hostIndicator = isUserHost
    ? '<span class="host-badge">Host</span>'
    : "";
  const displayName = userId === peer.id ? `${userName} (You)` : userName;

  userCard.innerHTML = `
        <span class="user-name">${displayName}</span>
        <img src="../Documents/user.svg" alt="User">
        ${hostIndicator}
    `;

  connectedUsers.appendChild(userCard);
}

function removeUserCard(userId) {
  const existingCard = connectedUsers.querySelector(
    `[data-peer-id="${userId}"]`
  );
  if (existingCard) {
    existingCard.remove();
  }
}

function updateUsersList(users) {
  connectedUsers.innerHTML = "";

  users.forEach((user) => {
    if (user && user.peerId) {
      const displayName = user.peerId === peer.id ? user.name : user.name;
      addUserCard(displayName, user.peerId, user.isHost);
    }
  });
}
function addMessage(userName, message, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.innerHTML = `
        <img src="../Documents/user.svg" alt="User">
        <div class="message-content">
            <span>${userName}</span>
            <p>${message}</p>
            ${timestamp ? `<small>${timestamp}</small>` : ""}
        </div>
    `;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

function updateOnlineCount() {
  const count = connectedUsers.children.length;
  onlineCount.textContent = `${count} online`;
}

// Event listeners
sendMessage.addEventListener("click", () => {
  if (chatInput.value.trim()) {
    socket.emit("chat-message", {
      sessionId: roomId,
      message: chatInput.value,
      userName: userName,
    });
    chatInput.value = "";
  }
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && chatInput.value.trim()) {
    sendMessage.click();
  }
});

endCallBtn.addEventListener("click", () => {
  Object.values(peers).forEach(({ call }) => {
    call.close();
  });
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop());
  }
  socket.disconnect();
  window.location.href = "localhost:5000/dashboard";
});

camBtn.addEventListener("click", () => {
  if (localStream) {
    isCamOn = !isCamOn;
    localStream.getVideoTracks().forEach((track) => (track.enabled = isCamOn));
    camBtn.style.backgroundColor = isCamOn ? "#9FEF00" : "#555";
    camBtn.textContent = isCamOn ? "Cam" : "Cam Off";
  }
});

micBtn.addEventListener("click", () => {
  if (localStream) {
    isMicOn = !isMicOn;
    localStream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
    micBtn.style.backgroundColor = isMicOn ? "#9FEF00" : "#555";
    micBtn.textContent = isMicOn ? "Mic" : "Mic Off";
  }
});

screenShareBtn.addEventListener("click", () => {
  if (!isHost) {
    alert("Only the host can share screen");
    return;
  }

  if (!isScreenSharing) {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((stream) => {
        screenStream = stream;
        isScreenSharing = true;
        screenShareBtn.textContent = "Stop Sharing";
        // Show the local screen preview in the UI
        const myScreen = document.createElement("video");
        myScreen.srcObject = stream;
        myScreen.autoplay = true;
        myScreen.muted = true;
        myScreen.playsInline = true;
        screenShareVideo.innerHTML = "";
        screenShareVideo.appendChild(myScreen);
        screenShareVideo.style.display = "block";

        socket.emit("start-screen-share", { sessionId: roomId });
        Object.keys(peers).forEach((peerId) => {
          const screenCall = peer.call(peerId, stream, {
            metadata: { type: "screen-share" },
          });

          screenShareCalls[peerId] = screenCall;

          screenCall.on("close", () => {
            delete screenShareCalls[peerId];
          });
        });

        stream.getVideoTracks()[0].onended = stopScreenSharing;
      })
      .catch((err) => {
        console.error("Error sharing screen:", err);
        alert("Error starting screen share: " + err.message);
      });
  } else {
    stopScreenSharing();
  }
});

function stopScreenSharing() {
  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop());
    screenStream = null;
    isScreenSharing = false;
    screenShareBtn.textContent = "Screen Share";

    // Close all screen-sharing calls
    Object.values(screenShareCalls).forEach((call) => call.close());
    screenShareCalls = {};

    // Notify server
    socket.emit("stop-screen-share", { sessionId: roomId });

    // Clear local display
    if (screenShareVideo) {
      screenShareVideo.innerHTML = "";
      screenShareVideo.style.display = "none";
    }
  }
}

peer.on("error", (err) => {
  console.error("Peer error:", err);
});

socket.on("connect", () => {});

socket.on("disconnect", () => {});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});
