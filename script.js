// Fallback response function
function getFallbackResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('מתי') || lowerQuestion.includes('תאריך')) {
        return 'פסטיבל סמילנסקי 2025 מתקיים ב-26-28 באוגוסט, בשעות 19:30-23:00 בכל יום!';
    }
    
    if (lowerQuestion.includes('איפה') || lowerQuestion.includes('מיקום')) {
        return 'הפסטיבל מתקיים בעיר העתיקה של באר שבע, ברחוב סמילנסקי והסביבה!';
    }
    
    if (lowerQuestion.includes('כרטיס') || lowerQuestion.includes('כניסה') || lowerQuestion.includes('מחיר')) {
        return 'הכניסה לפסטיבל חופשית לגמרי! לא צריך כרטיסים, פשוט באים ונהנים!';
    }
    
    return 'היי שם! אני ASK סמילנסקי! שאל אותי על לוח זמנים, מיקום, אמנים או כל דבר אחר על פסטיבל סמילנסקי 2025!';
}

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

// Initialize AI components
let askSmilansky = null;
let claudeConfig = null;
let promptBuilder = null;
let claudeEngine = null;

// Update welcome message dynamically
function updateWelcomeMessage(welcomeText) {
    const welcomeElement = document.querySelector('.bot-message .message-content');
    if (welcomeElement && welcomeText) {
        // Format the welcome message
        const formattedMessage = formatMessage(welcomeText);
        welcomeElement.innerHTML = formattedMessage;
        
        // Add link handlers if needed
        addLinkHandlers(welcomeElement);
    }
}

// Wait for all required classes to be available
function waitForScriptsToLoad() {
    return new Promise((resolve) => {
        const checkClasses = () => {
            if (typeof ClaudeConfig !== 'undefined' && 
                typeof PromptBuilder !== 'undefined' && 
                typeof ClaudeEngine !== 'undefined' && 
                typeof DataLoader !== 'undefined') {
                resolve();
            } else {
                setTimeout(checkClasses, 50);
            }
        };
        checkClasses();
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for all scripts to load properly
    await waitForScriptsToLoad();
    
    // Initialize DataLoader first to get welcome message
    const tempDataLoader = new DataLoader();
    await tempDataLoader.loadAllData();
    
    // Update welcome message dynamically
    updateWelcomeMessage(tempDataLoader.getWelcomeMessage());
    
    try {
        // Initialize Claude API components (no API key needed for Netlify)
        claudeConfig = new ClaudeConfig();
        promptBuilder = new window.PromptBuilder();
        await promptBuilder.initialize();
        
        claudeEngine = new ClaudeEngine(claudeConfig, promptBuilder);
        
        console.log('אסק סמילנסקי עם Claude API מוכן!');
        
    } catch (error) {
        console.error('Error initializing Claude API:', error);
    }
    
    // Focus on input when page loads (not on mobile to prevent keyboard popup)
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        messageInput.focus();
    }
    
    // Handle enter key press
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
});

// Create development mode indicator
function createDevModeIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'dev-mode-indicator';
    indicator.innerHTML = 'DEV MODE<div class="shortcut-hint">Ctrl+Shift+D</div>';
    indicator.addEventListener('click', () => {
        if (developerTools) {
            developerTools.togglePanel();
        }
    });
    document.body.appendChild(indicator);
}

// Send message function with Claude API integration
async function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (messageText === '') {
        return;
    }
    
    // Add user message to chat
    addMessage(messageText, 'user');
    
    // Clear input and disable button temporarily
    messageInput.value = '';
    sendButton.disabled = true;
    messageInput.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        let response;
        
        // Try Claude API via Netlify Function
        if (claudeEngine) {
            response = await claudeEngine.sendMessage(messageText);
        } 
        // Last resort fallback
        else {
            response = getFallbackResponse(messageText);
        }
        
        // Simulate thinking time
        setTimeout(() => {
            hideTypingIndicator();
            addMessage(response, 'bot');
            // Re-enable input
            sendButton.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
        }, Math.random() * 1000 + 800); // 0.8-1.8 seconds
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        setTimeout(() => {
            hideTypingIndicator();
            
            // Show specific error messages
            let errorMessage = 'אופס! משהו השתבש. ';
            if (error.message.includes('quota')) {
                errorMessage += 'נגמרה מכסת השימוש היומית. נסה מחר או שדרג את החשבון.';
            } else {
                errorMessage += 'נסה שוב או שאל אותי משהו אחר.';
            }
            
            addMessage(errorMessage, 'bot');
            
            // Re-enable input
            sendButton.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
        }, 1500);
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process text for links and formatting
    const processedText = formatMessage(text);
    messageContent.innerHTML = processedText;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Add click handlers for links
    addLinkHandlers(messageContent);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle link clicks
function handleLinkClick(url) {
    window.open(url, '_blank');
}

// Add some utility functions for better UX
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle window resize and mobile keyboard
window.addEventListener('resize', function() {
    setTimeout(scrollToBottom, 100);
});

// Handle mobile keyboard appearance
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // Mobile device detected
    messageInput.addEventListener('focus', function() {
        setTimeout(() => {
            scrollToBottom();
            // Scroll input into view on mobile
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
    
    // Additional handling for viewport changes
    const initialViewportHeight = window.innerHeight;
    window.addEventListener('resize', function() {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // If keyboard is likely open (significant height reduction)
        if (heightDifference > 150) {
            document.body.style.setProperty('--keyboard-height', `${heightDifference}px`);
            setTimeout(scrollToBottom, 100);
        } else {
            document.body.style.removeProperty('--keyboard-height');
        }
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Focus input with Ctrl+/
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        messageInput.focus();
    }
});

// Format message with links and styling
function formatMessage(text) {
    // Convert line breaks to proper paragraphs
    let formatted = text.split('\n').map(line => {
        if (line.trim() === '') return '';
        if (line.startsWith('**') && line.endsWith('**')) {
            // Bold headers
            return `<h4>${line.replace(/\*\*/g, '')}</h4>`;
        }
        if (line.includes('**')) {
            // Bold text within paragraphs
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        return `<p>${line}</p>`;
    }).join('');
    
    // Convert URLs to clickable links
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert email addresses
    formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
    
    // Convert Google Maps searches
    formatted = formatted.replace(/\[חפש "([^"]+)"\]/g, '<button class="map-link" data-search="$1">🗺️ פתח ב-Google Maps</button>');
    
    return formatted;
}

// Add click handlers for custom links
function addLinkHandlers(messageElement) {
    // Handle map links
    const mapLinks = messageElement.querySelectorAll('.map-link');
    mapLinks.forEach(link => {
        link.addEventListener('click', function() {
            const search = this.getAttribute('data-search');
            const url = `https://www.google.com/maps/search/${encodeURIComponent(search)}`;
            window.open(url, '_blank');
        });
    });
}