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

// === INSTAGRAM FEATURES ===

// Mock data for posts, stories, reels, notifications
let posts = JSON.parse(localStorage.getItem('ludoPosts')) || [];
let stories = JSON.parse(localStorage.getItem('ludoStories')) || [];
let reels = JSON.parse(localStorage.getItem('ludoReels')) || [];
let notifications = JSON.parse(localStorage.getItem('ludoNotifications')) || [];

// Load Feed
function loadFeed() {
    const container = document.getElementById('feedPosts');
    container.innerHTML = '';
    posts.slice(-10).reverse().forEach(post => {
        const postEl = createPostElement(post);
        container.appendChild(postEl);
    });
}

// Create Post Element
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card bg-gray-50 rounded-2xl p-4';
    div.innerHTML = `
        <div class="flex items-center mb-3">
            <img src="${post.avatar || 'https://via.placeholder.com/40'}" alt="avatar" class="w-10 h-10 rounded-full mr-3">
            <div>
                <p class="font-bold">${post.username}</p>
                <p class="text-sm text-gray-500">${post.date}</p>
            </div>
        </div>
        ${post.image ? `<img src="${post.image}" alt="post" class="w-full rounded-lg mb-3">` : ''}
        ${post.video ? `<video src="${post.video}" controls class="w-full rounded-lg mb-3"></video>` : ''}
        <p class="mb-3">${post.caption}</p>
        <div class="flex justify-between text-sm">
            <button onclick="likePost('${post.id}')" class="flex items-center ${post.liked ? 'text-red-500' : 'text-gray-500'}">
                <i class="fas fa-heart mr-1"></i> ${post.likes} Likes
            </button>
            <button onclick="commentPost('${post.id}')" class="flex items-center text-gray-500">
                <i class="fas fa-comment mr-1"></i> Comment
            </button>
            <button onclick="repost('${post.id}')" class="flex items-center text-gray-500">
                <i class="fas fa-retweet mr-1"></i> Repost
            </button>
        </div>
        <div id="comments-${post.id}" class="mt-2 text-xs text-gray-600"></div>
    `;
    return div;
}

// Show Post Modal
function showPostModal() {
    document.getElementById('postModal').classList.remove('hidden');
}

// Close Post Modal
function closePostModal() {
    document.getElementById('postModal').classList.add('hidden');
    document.getElementById('postCaption').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postVideo').value = '';
}

// Upload Post
function uploadPost() {
    const caption = document.getElementById('postCaption').value;
    const image = document.getElementById('postImage').files[0];
    const video = document.getElementById('postVideo').files[0];
    if (!caption && !image && !video) return alert('Add something!');

    const post = {
        id: Date.now(),
        username: currentUser.username,
        avatar: 'https://via.placeholder.com/40', // Mock
        caption,
        image: image ? URL.createObjectURL(image) : null,
        video: video ? URL.createObjectURL(video) : null,
        date: new Date().toLocaleString(),
        likes: 0,
        liked: false,
        comments: []
    };

    posts.unshift(post);
    localStorage.setItem('ludoPosts', JSON.stringify(posts));
    closePostModal();
    loadFeed();
    addNotification(`${currentUser.username} posted something new!`);
}

// Like Post
function likePost(id) {
    const post = posts.find(p => p.id == id);
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    localStorage.setItem('ludoPosts', JSON.stringify(posts));
    loadFeed();
    addNotification(`Someone liked your post!`);
}

// Comment Post (Simple prompt)
function commentPost(id) {
    const comment = prompt('Add comment:');
    if (comment) {
        const post = posts.find(p => p.id == id);
        post.comments.push({ user: currentUser.username, text: comment });
        localStorage.setItem('ludoPosts', JSON.stringify(posts));
        loadFeed();
        addNotification(`New comment on your post!`);
    }
}

// Repost
function repost(id) {
    const original = posts.find(p => p.id == id);
    const repost = {
        id: Date.now(),
        username: currentUser.username,
        caption: `Reposting: ${original.caption}`,
        originalId: id,
        date: new Date().toLocaleString(),
        likes: 0,
        liked: false
    };
    posts.unshift(repost);
    localStorage.setItem('ludoPosts', JSON.stringify(posts));
    loadFeed();
    addNotification(`Your post was reposted!`);
}

// === STORIES ===
function loadStories() {
    const container = document.getElementById('userStories');
    container.innerHTML = '';
    stories.forEach(story => {
        const div = document.createElement('div');
        div.className = 'stories-circle cursor-pointer';
        div.innerHTML = `<div class="w-16 h-16 bg-cover rounded-full" style="background-image: url(${story.image})" onclick="viewStory('${story.id}')"></div>`;
        container.appendChild(div);
    });
}

function viewStory(id) {
    const story = stories.find(s => s.id == id);
    document.getElementById('storyImage').src = story.image;
    document.getElementById('storyViewer').classList.remove('hidden');
}

function closeStory() {
    document.getElementById('storyViewer').classList.add('hidden');
}

// Upload Story (Add to Feed button or separate)
function uploadStory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const story = {
                id: Date.now(),
                username: currentUser.username,
                image: URL.createObjectURL(file),
                date: new Date().toISOString()
            };
            stories.unshift(story);
            localStorage.setItem('ludoStories', JSON.stringify(stories));
            loadStories();
            // Simulate 24h delete
            setTimeout(() => {
                stories = stories.filter(s => s.id != story.id);
                localStorage.setItem('ludoStories', JSON.stringify(stories));
                loadStories();
            }, 86400000); // 24h
        }
    };
    input.click();
}

// === REELS ===
function loadReels() {
    const container = document.getElementById('reelsFeed');
    container.innerHTML = '';
    reels.slice(-5).reverse().forEach(reel => {
        const div = document.createElement('div');
        div.className = 'reel-player relative rounded-2xl overflow-hidden';
        div.innerHTML = `
            <video src="${reel.video}" autoplay loop muted class="w-full h-full object-cover"></video>
            <div class="absolute bottom-4 left-4 text-white">
                <p class="font-bold">${reel.username}</p>
                <p class="text-sm">${reel.caption}</p>
            </div>
            <button onclick="likeReel('${reel.id}')" class="absolute top-4 right-4 text-white text-2xl">
                <i class="fas fa-heart ${reel.liked ? 'text-red-500' : ''}"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function showReelUpload() {
    document.getElementById('reelModal').classList.remove('hidden');
}

function closeReelModal() {
    document.getElementById('reelModal').classList.add('hidden');
}

function uploadReel() {
    const video = document.getElementById('reelVideo').files[0];
    const caption = document.getElementById('reelCaption').value;
    if (!video) return alert('Select video!');

    const reel = {
        id: Date.now(),
        username: currentUser.username,
        video: URL.createObjectURL(video),
        caption,
        liked: false,
        likes: 0
    };

    reels.unshift(reel);
    localStorage.setItem('ludoReels', JSON.stringify(reels));
    closeReelModal();
    loadReels();
}

function likeReel(id) {
    const reel = reels.find(r => r.id == id);
    reel.liked = !reel.liked;
    reel.likes += reel.liked ? 1 : -1;
    localStorage.setItem('ludoReels', JSON.stringify(reels));
    loadReels();
}

// === EXPLORE ===
function loadExplore() {
    const container = document.getElementById('explorePosts');
    container.innerHTML = '';
    // Sort by likes (trending)
    const trending = posts.sort((a, b) => b.likes - a.likes).slice(0, 9);
    trending.forEach(post => {
        if (post.image) {
            const img = document.createElement('img');
            img.src = post.image;
            img.className = 'w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90';
            img.onclick = () => alert('View post: ' + post.caption);
            container.appendChild(img);
        }
    });
}

// === NOTIFICATIONS ===
function loadNotifications() {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';
    notifications.slice(-10).reverse().forEach(notif => {
        const div = document.createElement('div');
        div.className = 'notification-item flex items-center p-3 bg-white rounded-lg shadow-sm';
        div.innerHTML = `
            <i class="fas fa-bell text-primary mr-3"></i>
            <span>${notif}</span>
            <span class="text-xs text-gray-500 ml-auto">${notif.time}</span>
        `;
        container.appendChild(div);
    });
}

function addNotification(text) {
    notifications.unshift({
        text,
        time: new Date().toLocaleTimeString()
    });
    localStorage.setItem('ludoNotifications', JSON.stringify(notifications));
    loadNotifications();
}

// Update showSection to handle new sections
const originalShowSection = showSection;
showSection = function(section) {
    originalShowSection(section);
    switch(section) {
        case 'feed': loadFeed(); break;
        case 'stories': loadStories(); break;
        case 'reels': loadReels(); break;
        case 'explore': loadExplore(); break;
        case 'notifications': loadNotifications(); break;
    }
};

// Add upload story to stories circle click or menu
document.querySelector('.stories-circle .fa-plus')?.addEventListener('click', uploadStory);

// Initial load if on dashboard
if (currentUser) {
    loadFeed();
    loadStories();
    loadReels();
    loadExplore();
    loadNotifications();
}
