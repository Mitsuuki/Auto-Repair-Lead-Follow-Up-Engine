// --- 100% BULLETPROOF CLOUDFLARE URL ---
const N8N_WEBHOOK_URL = "https://ships-generators-relative-wma.trycloudflare.com/webhook/apex-repair-chat";

let isSending = false;

function toggleBackend() {
    document.getElementById('backendPanel').classList.toggle('open');
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.toggle('open');
    toggleBtn.classList.toggle('hidden');
    if (chat.classList.contains('open')) {
        document.getElementById('user-input').focus();
    }
}

// Only auto-open chat if screen is larger than a phone
setTimeout(() => {
    if (window.innerWidth > 768) {
        const chat = document.getElementById('chatContainer');
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (!chat.classList.contains('open')) {
            chat.classList.add('open');
            toggleBtn.classList.add('hidden');
        }
    }
}, 2000);

function openChatWithPrefill(text) {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.add('open');
    toggleBtn.classList.add('hidden');
    const input = document.getElementById('user-input');
    input.value = text;
    
    input.style.height = "auto";
    input.style.height = (input.scrollHeight) + "px";
    
    input.focus();
}

const userInput = document.getElementById("user-input");
userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

const sessionId = "session_" + Math.floor(Math.random() * 1000000000);
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerHTML = text; 
    chatBox.insertBefore(msgDiv, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = "flex";
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = "none";
}

async function sendMessage() {
    if (isSending) return;

    const text = userInput.value.trim();
    if (!text) return;

    isSending = true;

    appendMessage(text, "user");
    userInput.value = "";
    userInput.style.height = "auto";
    userInput.disabled = true;
    sendBtn.disabled = true;
    
    showTyping();

    try {
        // CLEAN URL FOR CLOUDFLARE
        const liveUrl = N8N_WEBHOOK_URL + "?t=" + Date.now();
        
        const response = await fetch(liveUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionId: sessionId, message: text })
        });

        const data = await response.json();
        
        hideTyping();
        appendMessage(data.text || "Sorry, I encountered an error.", "bot");

        // --- LIVE EMAIL TERMINAL SIMULATION LOGIC ---
        if (data.trigger_follow_up === true || data.trigger_follow_up === "true") {
            const smsTerminal = document.getElementById("smsTerminal");
            const panel = document.getElementById("backendPanel");
            
            if (!panel.classList.contains("open")) {
                panel.classList.add("open");
            }

            smsTerminal.innerHTML += `<br><span style="color: #f59e0b;">> [LEAD ACQUIRED] Auto-Follow-up Sequence queued for ${data.lead_name || 'Client'} (${data.lead_email || 'Email'}). Dispatching in 60s...</span><br>`;
            smsTerminal.scrollTop = smsTerminal.scrollHeight;

            setTimeout(() => {
                const time = new Date().toLocaleTimeString();
                const smsMsg = `Hi ${data.lead_name || 'there'}, it's SoCal Auto Works. Checking in on your vehicle! Did you still need an estimate for the ${data.car_issue || 'repair'}? Let us know!`;
                
                smsTerminal.innerHTML += `<br><span style="color: #34d399;">[${time}] > EMAIL DISPATCHED SUCCESSFULLY</span><br>`;
                smsTerminal.innerHTML += `<span style="color: white;">TO: ${data.lead_email || 'Unknown Email'}</span><br>`;
                smsTerminal.innerHTML += `<span style="color: #94a3b8;">PAYLOAD: "${smsMsg}"</span><br>`;
                smsTerminal.scrollTop = smsTerminal.scrollHeight;
            }, 60000); 
        }

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        
        appendMessage("Network error or outdated browser detected. Please check your connection or call us directly.", "bot");
        
        // --- TELEMETRY TRACKER INJECTED ---
        const errorTrace = `[DIAGNOSTIC TRACE]<br>Error: ${error.name}<br>Message: ${error.message}<br>Check n8n CORS settings or Cloudflare connection!`;
        appendMessage(`<div style="font-size: 11px; color: #e11d48; margin-top: 8px; border-top: 1px solid rgba(225,29,72,0.2); padding-top: 8px; font-family: monospace; line-height: 1.3;">${errorTrace}</div>`, "bot");
        
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        isSending = false;
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}