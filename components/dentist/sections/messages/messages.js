// Messages JavaScript
let conversations = [];
let currentConversation = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
});

// Load conversations
function loadConversations() {
    // Initialize empty array - data will be populated from real-time sources
    conversations = [];

    // Try to load from localStorage first (for demo purposes)
    loadFromLocalStorage();
    
    // Set up real-time listeners (replace with your real-time data source)
    setupRealtimeListeners();
    
    displayConversations();
}

// Load data from localStorage (temporary - replace with your real-time source)
function loadFromLocalStorage() {
    try {
        const storedConversations = localStorage.getItem('dentalConversations');
        
        if (storedConversations) {
            conversations = JSON.parse(storedConversations);
        }
    } catch (error) {
        console.log('No existing conversations found or error loading from storage');
    }
}

// Set up real-time listeners (replace with your Firebase/WebSocket implementation)
function setupRealtimeListeners() {
    // Example: Listen for new conversations
    // firebase.firestore().collection('conversations').onSnapshot((snapshot) => {
    //     conversations = [];
    //     snapshot.forEach(doc => {
    //         conversations.push({ id: doc.id, ...doc.data() });
    //     });
    //     displayConversations();
    // });
    
    console.log('Messages section initialized - ready for real-time data');
}

// Display conversations list
function displayConversations() {
    const list = document.getElementById('conversationsList');
    
    if (conversations.length === 0) {
        list.innerHTML = `
            <div style="padding: 40px; color: #666; text-align: center;">
                <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="margin: 0 0 10px 0;">No conversations yet</h3>
                <p style="margin: 0;">Messages will appear here when patients contact you</p>
            </div>
        `;
        return;
    }

    list.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${currentConversation && currentConversation.id === conv.id ? 'active' : ''}" 
             onclick="selectConversation(${conv.id})">
            <div class="conversation-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="conversation-info">
                <div class="conversation-name">${conv.patientName}</div>
                <div class="conversation-last-message">${conv.lastMessage}</div>
            </div>
            <div style="text-align: right;">
                <div class="conversation-time">${conv.lastMessageTime}</div>
                ${conv.unread > 0 ? `<span style="background: #667eea; color: white; border-radius: 10px; padding: 2px 8px; font-size: 11px; font-weight: 600;">${conv.unread}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Select conversation
function selectConversation(id) {
    currentConversation = conversations.find(c => c.id === id);
    if (currentConversation) {
        // Mark as read
        currentConversation.unread = 0;
        
        // Update header
        document.getElementById('chatHeader').innerHTML = `
            <div class="chat-header-info">
                <div class="chat-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="chat-header-details">
                    <h4>${currentConversation.patientName}</h4>
                    <p>${currentConversation.patientEmail}</p>
                </div>
            </div>
        `;
        
        // Display messages
        displayMessages();
        
        // Show input area
        document.getElementById('chatInputArea').style.display = 'flex';
        
        // Update conversations list
        displayConversations();
    }
}

// Display messages
function displayMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!currentConversation || currentConversation.messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = currentConversation.messages.map(msg => `
        <div class="message ${msg.sender === 'dentist' ? 'sent' : 'received'}">
            <div class="message-bubble">${msg.text}</div>
            <div class="message-time">${msg.time}</div>
        </div>
    `).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !currentConversation) return;
    
    const newMessage = {
        sender: 'dentist',
        text: text,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    
    currentConversation.messages.push(newMessage);
    currentConversation.lastMessage = text;
    currentConversation.lastMessageTime = 'Just now';
    
    displayMessages();
    displayConversations();
    
    input.value = '';
    input.focus();
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Search conversations
function searchConversations(query) {
    const filtered = conversations.filter(conv => 
        conv.patientName.toLowerCase().includes(query.toLowerCase()) ||
        conv.patientEmail.toLowerCase().includes(query.toLowerCase())
    );
    
    const list = document.getElementById('conversationsList');
    list.innerHTML = filtered.map(conv => `
        <div class="conversation-item ${currentConversation && currentConversation.id === conv.id ? 'active' : ''}" 
             onclick="selectConversation(${conv.id})">
            <div class="conversation-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="conversation-info">
                <div class="conversation-name">${conv.patientName}</div>
                <div class="conversation-last-message">${conv.lastMessage}</div>
            </div>
            <div style="text-align: right;">
                <div class="conversation-time">${conv.lastMessageTime}</div>
            </div>
        </div>
    `).join('');
}

// New conversation
function newConversation() {
    alert('Opening new conversation form...');
    // Implement your new conversation logic here
}

// Real-time updates (replace with your actual real-time implementation)
// This function will be called when new conversations arrive from your backend
function updateConversationsData(newConversations) {
    conversations = newConversations;
    displayConversations();
}

// Example function to add new conversation (called when patient starts messaging)
function addNewConversation(conversationData) {
    const newConversation = {
        id: Date.now(), // Generate unique ID
        ...conversationData,
        lastMessage: 'Conversation started',
        lastMessageTime: 'Just now',
        unread: 0,
        messages: []
    };
    
    conversations.push(newConversation);
    displayConversations();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalConversations', JSON.stringify(conversations));
    
    return newConversation;
}

// Example function to add message to conversation
function addMessageToConversation(conversationId, messageData) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        const newMessage = {
            sender: messageData.sender,
            text: messageData.text,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        
        conversation.messages.push(newMessage);
        conversation.lastMessage = messageData.text;
        conversation.lastMessageTime = 'Just now';
        
        if (messageData.sender === 'patient') {
            conversation.unread++;
        }
        
        displayConversations();
        
        // Save to localStorage (replace with your backend save)
        localStorage.setItem('dentalConversations', JSON.stringify(conversations));
    }
}

