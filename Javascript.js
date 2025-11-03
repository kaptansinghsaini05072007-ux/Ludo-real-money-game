// === GROUP CHAT SYSTEM ===

let chatMessages = JSON.parse(localStorage.getItem('ludoChat')) || [];

// Load chat on start
function loadChat() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.innerHTML = '';
    chatMessages.forEach(msg => {
        addMessageToChat(msg);
    });
    scrollToBottom();
}

// Add message to chat
function addMessageToChat(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.user === currentUser.username;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble p-3 rounded-2xl ${isOwn ? 'bg-primary text-white ml-auto' : 'bg-chat text-dark'}`;
    bubble.innerHTML = `
        <div class="font-bold text-sm">${msg.user}</div>
        <div>${msg.text}</div>
        <div class="text-xs opacity-70">${msg.time}</div>
    `;
    container.appendChild(bubble);
}

// Send Message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !currentUser) return;

    const msg = {
        user: currentUser.username,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chatMessages.push(msg);
    localStorage.setItem('ludoChat', JSON.stringify(chatMessages));

    addMessageToChat(msg);
    input.value = '';
    scrollToBottom();
    closeEmojiPicker();
}

// Scroll to bottom
function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight;
}

// Emoji Picker
let emojiPicker = null;
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    if (picker.classList.contains('hidden')) {
        if (!emojiPicker) {
            emojiPicker = new EmojiMart.Picker({
                onEmojiSelect: (emoji) => {
                    const input = document.getElementById('chatInput');
                    input.value += emoji.native;
                    input.focus();
                },
                theme: 'light',
                skinTonePosition: 'none'
            });
            document.getElementById('emojiPicker').appendChild(emojiPicker);
        }
        picker.classList.remove('hidden');
    } else {
        closeEmojiPicker();
    }
}

function closeEmojiPicker() {
    document.getElementById('emojiPicker').classList.add('hidden');
}

// Enter key to send
document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Load chat when chat section opens
function showSection(section) {
    document.querySelectorAll('#dashboard > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(section + 'Section').classList.remove('hidden');
    toggleMenu();

    if (section === 'chat') {
        loadChat();
        // Simulate live updates every 5 sec
        setTimeout(() => {
            if (document.getElementById('chatSection').classList.contains('hidden') === false) {
                loadChat();
            }
        }, 5000);
    }
}

// Auto refresh chat every 10 seconds
setInterval(() => {
    if (currentUser && !document.getElementById('chatSection').classList.contains('hidden')) {
        const updated = JSON.parse(localStorage.getItem('ludoChat')) || [];
        if (updated.length > chatMessages.length) {
            chatMessages = updated;
            loadChat();
        }
    }
}, 10000);
