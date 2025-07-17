// System Prompt Builder for ASK Smilansky - Simple Version
class PromptBuilder {
    constructor() {
        this.dataLoader = new DataLoader();
        this.systemPrompt = null;
        this.userFeedback = [];
        this.conversationHistory = [];
        this.dataLoaded = false;
    }

    // האתחול יעבור לשרת - הקליינט לא טוען את המידע יותר
    async initialize() {
        console.log('🔄 PromptBuilder מוכן (השרת טוען את המידע)');
        this.systemPrompt = this.buildFallbackPrompt();
        this.dataLoaded = false;
        return true;
    }

    // השרת אחראי על ה-system prompt המלא - הפונקציה הזו לא נחוצה
    buildSystemPrompt() {
        return this.buildFallbackPrompt();
    }

    // הפונקציות הללו הוסרו - המידע יגיע רק מהשרת
    
    // prompt fallback אם data/ לא זמין
    buildFallbackPrompt() {
        return `אתה ASK סמילנסקי - האיש שיודע הכל על פסטיבל סמילנסקי 2025.
        
⚠️ כרגע אני פועל במצב מוגבל ללא גישה לקבצי המידע העדכניים.
אנא פנה לאתר הפסטיבל לקבלת מידע מדויק: https://www.bouras.co.il/smilansky

אני עדיין יכול לעזור עם שאלות כלליות על הפסטיבל!

{FEEDBACK_PLACEHOLDER}`;
    }

    async getSystemPrompt() {
        // השרת אחראי על ה-system prompt המלא - הקליינט לא שולח אותו
        return 'SERVER_HANDLES_PROMPT';
    }

    addConversation(user, assistant) {
        this.conversationHistory.push({ user, assistant, timestamp: new Date() });
        
        // Keep only last 10 conversations for context
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }

    getFeedbackList() {
        return this.userFeedback;
    }

    clearFeedback() {
        this.userFeedback = [];
    }

    updatePromptWithFeedback(feedback) {
        this.userFeedback.push({
            timestamp: new Date().toLocaleString('he-IL'),
            feedback: feedback
        });
        return this.getSystemPrompt();
    }
}

if (typeof window !== 'undefined') {
    window.PromptBuilder = PromptBuilder;
}