// System Prompt Builder for ASK Smilansky - Simple Version
class PromptBuilder {
    constructor() {
        this.dataLoader = new DataLoader();
        this.systemPrompt = null;
        this.userFeedback = [];
        this.conversationHistory = [];
        this.dataLoaded = false;
    }

    // טעינת מידע ויצירת prompt דינמי
    async initialize() {
        try {
            console.log('🔄 מתחיל טעינת מידע לPrompt Builder...');
            
            // טוען מידע מקבצי data/
            await this.dataLoader.loadAllData();
            
            // בונה את ה-prompt עם המידע הטרי
            this.systemPrompt = this.buildSystemPrompt();
            this.dataLoaded = true;
            
            console.log('✅ PromptBuilder מוכן עם מידע עדכני מ-data/');
            return true;
        } catch (error) {
            console.error('❌ שגיאה באתחול PromptBuilder:', error);
            // fallback למצב ללא data/
            this.systemPrompt = this.buildFallbackPrompt();
            this.dataLoaded = false;
            return false;
        }
    }

    buildSystemPrompt() {
        if (!this.dataLoader.isLoaded()) {
            return this.buildFallbackPrompt();
        }

        const data = this.dataLoader.getRawData();
        
        // בניית לוח זמנים דינמי מהנתונים
        const mainStageSchedule = this.buildMainStageSchedule();
        const allArtists = this.dataLoader.getAllArtists();
        
        // הוספת לינקים שימושיים
        data.usefulLinks = this.dataLoader.getUsefulLinks();
        
        return `אתה ASK סמילנסקי - מישהו שמכיר טוב את באר שבע ואת פסטיבל סמילנסקי 2025.

השתמש במידע הטרי והמדויק שלך על הפסטיבל, אל תסתמך על ידע כללי על אמנים. אם מישהו שואל על משהו שלא בנתונים שלך - תגיד שאתה לא בטוח ותפנה לאתר הפסטיבל.

PERSONALITY & TONE (הכי חשוב!):
- דבר כמו חבר שמכיר את הפסטיבל טוב ויודע לתת מידע מועיל
- טון רגוע, ביטחון עצמי, קול אבל לא מתלהב יתר על המידה
- שפה טבעית וישירה (לא רשימות אלא אם באמת נחוץ!)
- הימנע מביטויים מפוצצים כמו וואו, מטורף, אש, אחי
- אל תשתמש באימוג'ים בכלל
- תן למידע לדבר בעד עצמו

FESTIVAL INFO - פסטיבל סמילנסקי 2025 (מידע עדכני מקבצי data/):
${data.festivalInfo ? data.festivalInfo.substring(0, 2000) + '...' : 'מידע כללי על הפסטיבל'}

לוח זמנים במת סמילנסקי (עדכני מ-CSV):
${mainStageSchedule}

כל האמנים בפסטיבל:
${allArtists.slice(0, 20).join(', ')}${allArtists.length > 20 ? ', ועוד...' : ''}

STYLE & TONE (מקובץ style_tone.txt):
${data.styleTone ? data.styleTone.substring(0, 500) + '...' : 'טון ידידותי ומקומי'}

USEFUL LINKS - לינקים שימושיים:
השתמש בלינקים האלה כשמתאים לשאלה:
${data.usefulLinks || 'לינקים לא זמינים'}

הנחיות לשימוש בלינקים:
- אם שואלים על מקומות לינה, מלון, ללון בסביבה - תן את לינק הלינה
- אם שואלים על התוכנית המלאה, תוכניות, הכל - תן את לינק התוכנית המלאה
- אם שואלים על דרכי הגעה, איך להגיע, אוטובוס - תן את לינק דרכי הגעה
- אם שואלים איפה הפסטיבל, מיקום, כתובת - תן את לינק המיקום

שלב את הלינקים בצורה טבעית בתוך התשובה, לא סתם לזרוק אותם.

INSTRUCTIONS:
1. דבר תמיד בעברית כמו מישהו שמכיר את העניין
2. תן מידע מדויק בלבד על הפסטיבל מהמידע שלך
3. אם לא יודע משהו - תגיד שאתה לא בטוח ותפנה לאתר הפסטיבל
4. אל תעשה רשימות אלא אם כן באמת נחוץ לשאלה
5. שמור על טון רגוע וביטחון עצמי
6. אל תשתמש בביטויים רשמיים כמו בהתבסס על או ביטויים מפוצצים
7. אל תשתמש באימוג'ים בכלל

CURRENT FEEDBACK/CORRECTIONS:
{FEEDBACK_PLACEHOLDER}

תמיד זכור - דבר בטון טבעי ורגוע. תן מידע מועיל בלי להפריז בהתלהבות.`;
    }

    // בניית לוח זמנים דינמי
    buildMainStageSchedule() {
        if (!this.dataLoader.isLoaded()) return 'לוח זמנים לא זמין';
        
        const mainStage = this.dataLoader.cache.venues.mainStage;
        if (!Array.isArray(mainStage)) return 'לוח זמנים לא זמין';
        
        const schedule = {};
        
        // קיבוץ לפי תאריך
        mainStage.forEach(row => {
            if (row['מה קורה'] === 'הופעה') {
                const date = row['תאריך'];
                if (!schedule[date]) schedule[date] = [];
                
                schedule[date].push({
                    artist: row['מי קורה'],
                    time: row['מתי קורה']
                });
            }
        });
        
        // פורמט לטקסט
        let scheduleText = '';
        for (const [date, shows] of Object.entries(schedule)) {
            const dayName = this.getHebrewDayName(date);
            scheduleText += `${date} (${dayName}): `;
            scheduleText += shows.map(show => `${show.artist} (${show.time})`).join(' → ');
            scheduleText += '\n';
        }
        
        return scheduleText;
    }
    
    // המרת תאריך ליום בשבוע בעברית
    getHebrewDayName(dateStr) {
        const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        
        // פרסור התאריך (פורמט: dd.mm.yy)
        const [day, month, year] = dateStr.split('.').map(num => parseInt(num));
        const fullYear = 2000 + year;
        
        const date = new Date(fullYear, month - 1, day);
        return days[date.getDay()];
    }
    
    // prompt fallback אם data/ לא זמין
    buildFallbackPrompt() {
        return `אתה ASK סמילנסקי - האיש שיודע הכל על פסטיבל סמילנסקי 2025.
        
⚠️ כרגע אני פועל במצב מוגבל ללא גישה לקבצי המידע העדכניים.
אנא פנה לאתר הפסטיבל לקבלת מידע מדויק: https://www.bouras.co.il/smilansky

אני עדיין יכול לעזור עם שאלות כלליות על הפסטיבל!

{FEEDBACK_PLACEHOLDER}`;
    }

    async getSystemPrompt() {
        // אם עדיין לא הותחל - מתחיל עכשיו
        if (!this.systemPrompt) {
            await this.initialize();
        }
        
        return this.systemPrompt.replace('{FEEDBACK_PLACEHOLDER}', 
            this.userFeedback.length > 0 
                ? this.userFeedback.map(f => `- ${f.feedback}`).join('\n')
                : 'אין הערות פיתוח כרגע.'
        );
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