// Claude API Configuration
class ClaudeConfig {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-5-sonnet-20241022'; // Default model
        this.maxTokens = 1000;
        this.availableModels = {
            'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (מומלץ)',
            'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (זול)',
            'claude-3-opus-20240229': 'Claude 3 Opus (מתקדם)'
        };
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    setModel(model) {
        if (this.availableModels[model]) {
            this.model = model;
        }
    }

    getAvailableModels() {
        return this.availableModels;
    }

    isConfigured() {
        return this.apiKey && this.apiKey.length > 0;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ClaudeConfig = ClaudeConfig;
}