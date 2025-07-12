// מנוע ה-AI של ASK סמילנסקי - Fallback פשוט בלבד
class AskSmilansky {
    constructor() {
        this.name = "ASK סמילנסקי";
        this.dataLoader = new DataLoader();
        this.dataLoaded = false;
        
        // אתחול נתונים
        this.initializeData();
    }
    
    async initializeData() {
        try {
            await this.dataLoader.loadAllData();
            this.dataLoaded = true;
            console.log('✅ ASK סמילנסקי נטען עם מידע עדכני מ-data/');
        } catch (error) {
            console.warn('⚠️ ASK סמילנסקי פועל במצב מוגבל - ללא גישה לקבצי data/');
            this.dataLoaded = false;
        }
    }

    // פונקציה ראשית - רק Fallback פשוט!
    async processQuestion(question) {
        // אם יש בעיה חמורה עם טעינת המידע
        if (!this.dataLoaded) {
            return this.getErrorMessage();
        }
        
        // Fallback פשוט - Claude API אמור לטפל בהכל
        return this.getSimpleFallback(question);
    }

    // הודעת שגיאה פשוטה
    getErrorMessage() {
        return `היי! אני ASK סמילנסקי, אבל כרגע יש לי בעיה קטנה בטעינת המידע העדכני על הפסטיבל.
        
🌐 לכל המידע המדויק ביותר על פסטיבל סמילנסקי 2025, בקר באתר הרשמי:
https://www.bouras.co.il/smilansky

תוכל לנסות שוב בעוד רגע, או לפנות ישירות לאתר הפסטיבל.`;
    }

    // Fallback פשוט - Claude API אמור לטפל בכל השאר
    getSimpleFallback(question) {
        return `היי! אני ASK סמילנסקי ואני כאן לעזור עם כל השאלות על פסטיבל סמילנסקי 2025!

🎭 **פסטיבל סמילנסקי 2025**
📅 26-28 באוגוסט | העיר העתיקה באר שבע
🎫 כניסה חופשית לגמרי!

לכל המידע המלא והעדכני:
🌐 https://www.bouras.co.il/smilansky

נסה לשאול אותי שוב, או עיין באתר הפסטיבל למידע מפורט!`;
    }

    // פונקציות עזר לDataLoader - לשימוש PromptBuilder
    isDataLoaded() {
        return this.dataLoaded;
    }

    getDataLoader() {
        return this.dataLoader;
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AskSmilansky;
} else {
    window.AskSmilansky = AskSmilansky;
}