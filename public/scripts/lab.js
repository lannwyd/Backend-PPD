

document.addEventListener('DOMContentLoaded', function() {
   

   
    const compile_btn = document.querySelector('.button0');
    const flash_btn = document.querySelector('.button1');

 
    const upload_btn = document.querySelector('.open');
    const save_btn = document.querySelector('.save');
    const save_as_btn = document.querySelector('.save-as');
    const save_hex_btn = document.querySelector('.save-hex-file');
    const fileInput = document.getElementById('fileInput'); 

   
    const video_stream = document.querySelector('.video-stream');
    const stream_text = document.querySelector('.stream_text');
    const capture_btn = document.querySelector('.capture');

 
    const sessionTimeEl = document.querySelector('.session-time');
    const sessionStatus1 = document.querySelector('.session-status1');
    const sessionStatus2 = document.querySelector('.session-status2');

    
    const consoleBox = document.querySelector('.console-box1');
    const consoleBox2 = document.querySelector('.console-box2');
    const inputField = document.querySelector('.input-field');
    const sendBtn = document.querySelector('.send');

  
    const line = document.querySelector('.line');
    inputField.disabled=true;

   
    const resetBtn = document.querySelector('#reset');
    const testBtn = document.querySelector('#test');

    let CompErr=0; 
    let flag;

    let socket;
    function checkwebtocken() {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.error("No JWT token found in localStorage");
            window.location.href = '/login';
           
        }
        return token;
    }
    try {
        socket = io('http://localhost:4000',{
             auth: {
    token: checkwebtocken()
  }
        });
        console.log("Socket.io connection initialized");
        
        const clientpath = `client_${Math.random().toString(36).substr(2, 9)}`;
        const clientId = Math.floor(100000000 + Math.random() * 900000000);
        socket.emit("register", clientId);
        
        //---------------- Socket Events ------------------
        const ctx = video_stream.getContext('2d'); 
        socket.on('redirect', (data) => {
  window.location.href = data.url;
});

        socket.on("video-frame", (base64Frame) => {
            if (video_stream && ctx) {
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, video_stream.width, video_stream.height); 
                    ctx.drawImage(img, 0, 0, video_stream.width, video_stream.height); 
                };
                img.src = `data:image/jpeg;base64,${base64Frame}`; 
            }
        });
        let sessionTimerInterval = null;
        socket.on("control-granted", () => {
            
            if (video_stream) video_stream.style.display = "block";
            if (stream_text) stream_text.style.display = "none";
            inputField.disabled=false;
            flash_btn.style.display = "block";
            console.log("Control granted, starting session timer...");
            
            let duration = 2 * 60; 
            
            if (sessionTimerInterval) clearInterval(sessionTimerInterval);
            
            sessionTimerInterval = setInterval(() => {
                if (!sessionTimeEl) return;
                
                const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
                const seconds = (duration % 60).toString().padStart(2, '0');
                sessionTimeEl.textContent = `${minutes}:${seconds}`;
                
                if (duration <= 0) {
                    clearInterval(sessionTimerInterval);
                    sessionTimerInterval = null;
                } else {
                    duration--;
                }
            }, 1000);
        });
        
        socket.on("control-expired", () => {
            if (video_stream) video_stream.style.display = "none ";
            if (stream_text) stream_text.style.display = "block";
            if (sessionTimeEl) sessionTimeEl.textContent = "00:00";
            if (inputField) inputField.disabled=true;
             window.location.href = '/dashboard';
            flash_btn.style.display = "none";
            
            if (sessionTimerInterval) {
                clearInterval(sessionTimerInterval);
                sessionTimerInterval = null;
            }
        });

        socket.on("queued",()=>{
            video_stream.style.display="none";
            stream_text.style.display="block";
            flash_btn.style.display="none";
            stream_text.setValue="You Are Queued , wait untill the device is free for camera feed";
        })
        
        socket.on("log", (msg) => {
            if (!consoleBox) return;
            
            const line = document.createElement('div');
            line.textContent = msg;
            consoleBox.appendChild(line);
            consoleBox.scrollTop = consoleBox.scrollHeight; 
        });
        
        socket.on("compile-success", (base64Hex) => {
            console.log("Compilation successful, received HEX file!");
            localStorage.setItem("hexFile", base64Hex.hexBase64);
            
            if (consoleBox) {
                const line = document.createElement('div');
                line.textContent = "Compilation successful";
                consoleBox.appendChild(line);
                consoleBox.scrollTop = consoleBox.scrollHeight;
            }
            
         
        
        });
        
        socket.on("compile-fail", (errorMsg) => {
            console.error("Compilation failed:", errorMsg);
            try{
                if (consoleBox) {
                    const line = document.createElement('div');
                    line.textContent = "Compilation failed: " + errorMsg;
                    consoleBox.appendChild(line);
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }
                CompErr=CompErr+1;
                socket.emit('Error-Counts', ({clientId,errorcount: CompErr}));
                console.log(CompErr)
            }catch(err){
                console.log(err.mess);
                
            }
        });
        
        
        
        socket.on("flash-success", () => {
            console.log(" Flash successful");
            
            if (consoleBox) {
                const line = document.createElement('div');
                line.textContent = "Flash successful";
                consoleBox.appendChild(line);
                consoleBox.scrollTop = consoleBox.scrollHeight;
            }
        });
        
        socket.on("flash-fail", () => {
            console.error("Flash failed");
            
            if (consoleBox) {
                const line = document.createElement('div');
                line.textContent = "Flash failed";
                consoleBox.appendChild(line);
                consoleBox.scrollTop = consoleBox.scrollHeight;
            }
        });
        socket.on('serial-data', (data) => {
            if (!consoleBox2) return;
            
            const line = document.createElement('div');
            line.textContent = data;
            consoleBox2.appendChild(line);
            consoleBox2.scrollTop = consoleBox2.scrollHeight; 
        }
        );
      
        
        //----------------- Event Listeners ------------------
        
        if (compile_btn) {
            compile_btn.addEventListener('click', function(e) {
                e.preventDefault();  
                e.stopPropagation(); 
                console.log(" Compile button clicked!");
                
                if (consoleBox) consoleBox.innerHTML = ""; 
                
         
                const code = window.editor ? window.editor.getValue() : "";
                socket.emit("compile-code", { code, clientpath, clientId });
            });
        }
        
        if (flash_btn) {
         
            flash_btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); 
                console.log("Flash button clicked!");
                
                if (consoleBox) consoleBox.innerHTML = "";
                
                const hex = localStorage.getItem("hexFile")
                const hexbase64=btoa(hex)

                
                if (!hexbase64) {
                    alert("No hex file available. Please compile the code first.");
                    return;
                }
                
                socket.emit('flash-code', { hexbase64, clientpath });
            });
        
    
        }
        
        //----------------- File Operations ------------------
        
        if (upload_btn && fileInput) {
            upload_btn.addEventListener('click', function() {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function() {
                    if (window.editor) {
                        window.editor.setValue(reader.result);
                    }
                };
                reader.readAsText(file);
            });
        }
        
        if (save_btn) {
            save_btn.addEventListener('click', function() {
                if (!window.editor) return;
                
                const content = window.editor.getValue();
                const blob = new Blob([content], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'sketch.ino';
                a.click();
                URL.revokeObjectURL(a.href);
            });
        }
        
        if (save_as_btn) {
            save_as_btn.addEventListener('click', function() {
                if (!window.editor) return;
                
                const content = window.editor.getValue();
                const blob = new Blob([content], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'sketch.ino';
                a.click();
                URL.revokeObjectURL(a.href);
            });
        }
        
        if (save_hex_btn) {
            save_hex_btn.addEventListener('click', function() {
                const hexbase64 = localStorage.getItem("hexFile");
                if (!hexbase64) {
                    alert("No hex file available. Please compile the code first.");
                    return;
                }
                
                const link = document.createElement('a');
                link.href = `data:application/octet-stream;base64,${hexbase64}`;
                link.download = 'program.hex';
                link.click();
            });
        }

        if (sendBtn && inputField && consoleBox2) {
            sendBtn.addEventListener('click', function() {
                if (inputField.value.trim() !== "") {
                    socket.emit('serial-command', { 
                        command: inputField.value, 
                        clientId: clientId 
                    });
                    
                    const line = document.createElement('div');
                    line.textContent = "> " + inputField.value;
                    consoleBox2.appendChild(line);
                    consoleBox2.scrollTop = consoleBox2.scrollHeight;
                    
                    inputField.value = "";
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                socket.emit('reset-device', (clientId));
                
                if (consoleBox) {
                    const line = document.createElement('div');
                    line.textContent = "Resetting device...";
                    consoleBox.appendChild(line);
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }
            });
        }
        
        if (testBtn) {
            testBtn.addEventListener('click', function() {
                socket.emit('test-device', ( clientId) );
                
                if (consoleBox) {
                    const line = document.createElement('div');
                    line.textContent = " Testing device...";
                    consoleBox.appendChild(line);
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }
            });
        }
        
        if (capture_btn && video_stream) {
            capture_btn.addEventListener('click', function() {
                if (video_stream) {
                    const a = document.createElement('a');
                    a.href = video_stream.toDataURL('image/png');
                    a.download = 'captured-stream.png';
                    a.click();
                }
            });
        }
        
    } catch (error) {
        console.error("Error initializing Socket.io: ", error);
      
        if (consoleBox) {
            const errorLine = document.createElement('div');
            errorLine.textContent = " Error connecting to the server. Please check your connection.";
            errorLine.style.color = "red";
            consoleBox.appendChild(errorLine);
        }
    }
});