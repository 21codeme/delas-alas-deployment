// Messages JavaScript
(function() {
let conversations = [];
let messages = [];
let currentConversation = null;
let currentDentist = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Messages section loaded');
    
    // Load messages data
    loadMessages();
    
    // Set up real-time updates
    setInterval(updateMessages, 30000); // Update every 30 seconds
});

// Load messages data
function loadMessages() {
    console.log('Loading messages...');
    
    // Simulate loading delay
    setTimeout(() => {
        // Generate sample conversations
        conversations = [
            {
                id: 1,
                dentist: 'Dr. Smith',
                lastMessage: 'Your next appointment is scheduled for tomorrow at 10 AM.',
                lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: 2,
                status: 'online'
            },
            {
                id: 2,
                dentist: 'Dr. Johnson',
                lastMessage: 'Thank you for your question. I\'ll get back to you soon.',
                lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
                unreadCount: 0,
                status: 'offline'
            },
            {
                id: 3,
                dentist: 'Dr. Williams',
                lastMessage: 'The treatment plan looks good. We can proceed.',
                lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
                unreadCount: 1,
                status: 'online'
            }
        ];
        
        // Generate sample messages
        messages = [
            {
                id: 1,
                conversationId: 1,
                sender: 'Dr. Smith',
                content: 'Hello! I wanted to remind you about your appointment tomorrow.',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                type: 'received'
            },
            {
                id: 2,
                conversationId: 1,
                sender: 'Patient',
                content: 'Thank you for the reminder. I\'ll be there on time.',
                timestamp: new Date(Date.now() - 3500000).toISOString(),
                type: 'sent'
            },
            {
                id: 3,
                conversationId: 1,
                sender: 'Dr. Smith',
                content: 'Great! See you tomorrow at 10 AM.',
                timestamp: new Date(Date.now() - 3400000).toISOString(),
                type: 'received'
            },
            {
                id: 4,
                conversationId: 2,
                sender: 'Patient',
                content: 'I have a question about my treatment plan.',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                type: 'sent'
            },
            {
                id: 5,
                conversationId: 2,
                sender: 'Dr. Johnson',
                content: 'Thank you for your question. I\'ll get back to you soon.',
                timestamp: new Date(Date.now() - 7100000).toISOString(),
                type: 'received'
            },
            {
                id: 6,
                conversationId: 3,
                sender: 'Dr. Williams',
                content: 'The treatment plan looks good. We can proceed.',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                type: 'received'
            }
        ];
        
        updateMessageStats();
        displayConversations();
        console.log('Messages loaded:', messages.length);
    }, 500);
}

// Update message statistics
function updateMessageStats() {
    const total = messages.length;
    const unread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const sent = messages.filter(m => m.type === 'sent').length;
    const activeDentists = conversations.filter(conv => conv.status === 'online').length;
    
    document.getElementById('totalMessages').textContent = total;
    document.getElementById('unreadMessages').textContent = unread;
    document.getElementById('sentMessages').textContent = sent;
    document.getElementById('activeDentists').textContent = activeDentists;
}

// Display conversations
function displayConversations() {
    const container = document.getElementById('conversationsList');
    container.innerHTML = '';
    
    conversations.forEach(conversation => {
        const conversationElement = createConversationElement(conversation);
        container.appendChild(conversationElement);
    });
}

// Create conversation element
function createConversationElement(conversation) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    div.onclick = () => selectConversation(conversation.id);
    
    div.innerHTML = `
        <div class="conversation-header">
            <span class="conversation-name">${conversation.dentist}</span>
            <span class="conversation-time">${formatTime(conversation.lastMessageTime)}</span>
        </div>
        <div class="conversation-preview">${conversation.lastMessage}</div>
        ${conversation.unreadCount > 0 ? `<div class="conversation-unread">${conversation.unreadCount}</div>` : ''}
    `;
    
    return div;
}

// Select conversation
function selectConversation(conversationId) {
    console.log('Selecting conversation:', conversationId);
    
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    currentConversation = conversation;
    currentDentist = conversation.dentist;
    
    // Update active conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update chat header
    document.getElementById('chatUserName').textContent = conversation.dentist;
    document.getElementById('chatUserStatus').textContent = conversation.status === 'online' ? 'Online' : 'Offline';
    
    // Show chat input
    document.getElementById('chatInputContainer').style.display = 'block';
    
    // Load messages for this conversation
    loadConversationMessages(conversationId);
    
    // Mark messages as read
    markMessagesAsRead(conversationId);
}

// Load conversation messages
function loadConversationMessages(conversationId) {
    const container = document.getElementById('chatMessages');
    const conversationMessages = messages.filter(msg => msg.conversationId === conversationId);
    
    // Clear welcome message
    container.innerHTML = '';
    
    if (conversationMessages.length === 0) {
        container.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-comments"></i>
                <h3>Start a conversation</h3>
                <p>Send a message to ${currentDentist} to start chatting.</p>
            </div>
        `;
        return;
    }
    
    // Sort messages by timestamp
    conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Create message elements
    conversationMessages.forEach(message => {
        const messageElement = createMessageElement(message);
        container.appendChild(messageElement);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Create message element
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.type}`;
    
    div.innerHTML = `
        <div class="message-content">
            ${message.content}
            <div class="message-time">${formatTime(message.timestamp)}</div>
        </div>
    `;
    
    return div;
}

// Mark messages as read
function markMessagesAsRead(conversationId) {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
        conversation.unreadCount = 0;
        updateMessageStats();
        displayConversations();
    }
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content || !currentConversation) return;
    
    console.log('Sending message:', content);
    
    // Create new message
    const newMessage = {
        id: Date.now(),
        conversationId: currentConversation.id,
        sender: 'Patient',
        content: content,
        timestamp: new Date().toISOString(),
        type: 'sent'
    };
    
    // Add to messages array
    messages.push(newMessage);
    
    // Update conversation
    currentConversation.lastMessage = content;
    currentConversation.lastMessageTime = newMessage.timestamp;
    
    // Update UI
    loadConversationMessages(currentConversation.id);
    displayConversations();
    updateMessageStats();
    
    // Clear input
    input.value = '';
    
    // Simulate response (for demo purposes)
    setTimeout(() => {
        simulateResponse();
    }, 2000);
}

// Simulate response from dentist
function simulateResponse() {
    if (!currentConversation) return;
    
    const responses = [
        'Thank you for your message. I\'ll get back to you soon.',
        'I understand your concern. Let me check your records.',
        'That\'s a good question. I\'ll discuss this with you at your next appointment.',
        'I\'ll make a note of this for our next visit.',
        'Thank you for letting me know. I\'ll update your treatment plan accordingly.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const responseMessage = {
        id: Date.now() + 1,
        conversationId: currentConversation.id,
        sender: currentDentist,
        content: randomResponse,
        timestamp: new Date().toISOString(),
        type: 'received'
    };
    
    messages.push(responseMessage);
    currentConversation.lastMessage = randomResponse;
    currentConversation.lastMessageTime = responseMessage.timestamp;
    
    loadConversationMessages(currentConversation.id);
    displayConversations();
    updateMessageStats();
}

// Handle key press in message input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Start new conversation
function startNewConversation() {
    console.log('Starting new conversation');
    document.getElementById('newMessageModal').style.display = 'block';
}

// Create new message
function createNewMessage(event) {
    event.preventDefault();
    
    const recipient = document.getElementById('messageRecipient').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    
    if (!recipient || !subject || !content) return;
    
    console.log('Creating new message:', { recipient, subject, content });
    
    // Create new conversation
    const newConversation = {
        id: Date.now(),
        dentist: recipient,
        lastMessage: content,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        status: 'online'
    };
    
    // Create new message
    const newMessage = {
        id: Date.now() + 1,
        conversationId: newConversation.id,
        sender: 'Patient',
        content: content,
        timestamp: new Date().toISOString(),
        type: 'sent'
    };
    
    // Add to arrays
    conversations.unshift(newConversation);
    messages.push(newMessage);
    
    // Update UI
    displayConversations();
    updateMessageStats();
    
    // Close modal and reset form
    closeModal('newMessageModal');
    document.getElementById('newMessageForm').reset();
    
    // Show success message
    showToast('Message sent successfully!', 'success');
    
    // Select the new conversation
    setTimeout(() => {
        selectConversation(newConversation.id);
    }, 500);
}

// Clear chat
function clearChat() {
    if (!currentConversation) return;
    
    if (confirm('Are you sure you want to clear this conversation?')) {
        // Remove messages for current conversation
        messages = messages.filter(msg => msg.conversationId !== currentConversation.id);
        
        // Update conversation
        currentConversation.lastMessage = 'No messages yet';
        currentConversation.lastMessageTime = new Date().toISOString();
        
        // Update UI
        loadConversationMessages(currentConversation.id);
        displayConversations();
        updateMessageStats();
        
        showToast('Conversation cleared', 'success');
    }
}

// Close modal
function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    document.getElementById(modalId).style.display = 'none';
}

// Update messages (real-time simulation)
function updateMessages() {
    console.log('Updating messages...');
    
    // Simulate new messages occasionally
    if (Math.random() < 0.1 && conversations.length > 0) {
        const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
        const responses = [
            'I have an update about your treatment.',
            'Your test results are ready.',
            'I wanted to follow up on your last visit.',
            'There\'s a change in your appointment schedule.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const newMessage = {
            id: Date.now(),
            conversationId: randomConversation.id,
            sender: randomConversation.dentist,
            content: randomResponse,
            timestamp: new Date().toISOString(),
            type: 'received'
        };
        
        messages.push(newMessage);
        randomConversation.lastMessage = randomResponse;
        randomConversation.lastMessageTime = newMessage.timestamp;
        randomConversation.unreadCount++;
        
        displayConversations();
        updateMessageStats();
        
        // If this is the current conversation, update the chat
        if (currentConversation && currentConversation.id === randomConversation.id) {
            loadConversationMessages(randomConversation.id);
        }
    }
}

// Utility functions
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
        return `${Math.floor(diff / 3600000)}h ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    if (window.parent && window.parent.showToast) {
        window.parent.showToast(message, type);
    } else {
        console.log(`Toast (${type}):`, message);
    }
}

// Navigation function for sections
function navigateToSection(sectionId) {
    console.log('Messages navigateToSection called with:', sectionId);
    
    // Dispatch a custom event to the main window
    const event = new CustomEvent('navigateToSection', { 
        detail: { sectionId: sectionId } 
    });
    window.dispatchEvent(event);
}

// Export functions for global access
window.startNewConversation = startNewConversation;
window.createNewMessage = createNewMessage;
window.closeModal = closeModal;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.clearChat = clearChat;
window.navigateToSection = navigateToSection;
})();
