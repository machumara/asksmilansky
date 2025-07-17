// Claude API Engine
class ClaudeEngine {
    constructor(config, promptBuilder) {
        this.config = config;
        this.promptBuilder = promptBuilder;
        this.requestCount = 0;
        this.dailyUsage = {
            date: new Date().toDateString(),
            requests: 0,
            estimatedCost: 0
        };
    }

    async sendMessage(userMessage) {
        // No API key check needed - handled by Netlify Function
        this.updateUsageStats();

        try {
            // Check if there's a relevant link for this question
            const relevantLink = this.promptBuilder.dataLoader.getRelevantLink(userMessage);
            
            // Use Netlify function instead of direct API call
            // The server will handle the complete system prompt from data files
            const response = await fetch('/.netlify/functions/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    relevant_link: relevantLink
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Proxy Error: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            let assistantMessage = data.content[0].text;

            // Note: Server now handles link integration in the prompt
            // but we keep this for backward compatibility if needed

            // Update conversation history
            this.promptBuilder.addConversation(userMessage, assistantMessage);

            // Update usage statistics (estimate)
            this.updateCostEstimate({
                input_tokens: userMessage.length / 3, // rough estimate
                output_tokens: assistantMessage.length / 3
            });

            return assistantMessage;

        } catch (error) {
            console.error('Error calling Claude API via proxy:', error);
            throw error;
        }
    }

    updateUsageStats() {
        const today = new Date().toDateString();
        
        if (this.dailyUsage.date !== today) {
            this.dailyUsage = {
                date: today,
                requests: 0,
                estimatedCost: 0
            };
        }

        this.requestCount++;
        this.dailyUsage.requests++;
    }

    updateCostEstimate(usage) {
        if (usage) {
            // Claude Sonnet pricing (approximate)
            const inputCost = (usage.input_tokens / 1000000) * 3; // $3 per 1M tokens
            const outputCost = (usage.output_tokens / 1000000) * 15; // $15 per 1M tokens
            const requestCost = inputCost + outputCost;
            
            this.dailyUsage.estimatedCost += requestCost;
        }
    }

    getUsageStats() {
        return {
            totalRequests: this.requestCount,
            dailyRequests: this.dailyUsage.requests,
            estimatedDailyCost: this.dailyUsage.estimatedCost,
            date: this.dailyUsage.date
        };
    }

    resetDailyStats() {
        this.dailyUsage = {
            date: new Date().toDateString(),
            requests: 0,
            estimatedCost: 0
        };
    }
}

if (typeof window !== 'undefined') {
    window.ClaudeEngine = ClaudeEngine;
}