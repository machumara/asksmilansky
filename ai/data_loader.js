// Data Loader - קוראים מידע מקבצי data/
class DataLoader {
    constructor() {
        this.cache = {};
        this.loaded = false;
    }

    // טעינת כל המידע מקבצי data/
    async loadAllData() {
        try {
            console.log('🔄 טוען מידע מקבצי data/...');
            
            // טוען מידע כללי על הפסטיבל
            this.cache.festivalInfo = await this.loadFile('data/festival_info/fest_info.txt');
            
            // טוען סגנון וטון
            this.cache.styleTone = await this.loadFile('data/style_tone/style_tone.txt');
            
            // טוען הודעת פתיחה
            this.cache.welcomeMessage = await this.loadFile('data/welcome_message.txt');
            
            // טוען לינקים שימושיים
            this.cache.usefulLinks = await this.loadFile('data/links/useful_links.txt');
            
            // טוען לוחות זמנים מכל המתחמים
            this.cache.venues = {};
            this.cache.venues.mainStage = await this.loadCSV('data/venues/במת_סמילנסקי.csv');
            this.cache.venues.danceStage = await this.loadCSV('data/venues/במת_המחול.csv');
            this.cache.venues.redStage = await this.loadCSV('data/venues/הבמה_האדומה.csv');
            this.cache.venues.elevatingStage = await this.loadCSV('data/venues/הבמה_המרימה.csv');
            this.cache.venues.breakingPoint = await this.loadCSV('data/venues/breaking_point.csv');
            
            this.loaded = true;
            console.log('✅ כל המידע נטען בהצלחה מקבצי data/');
            
            return this.cache;
        } catch (error) {
            console.error('❌ שגיאה בטעינת מידע מקבצי data/:', error);
            this.loaded = false;
            throw error;
        }
    }

    // טוען קובץ טקסט
    async loadFile(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            return await response.text();
        } catch (error) {
            console.error(`שגיאה בטעינת קובץ ${path}:`, error);
            throw error;
        }
    }

    // טוען לינקים שימושיים
    async loadUsefulLinks(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            const text = await response.text();
            
            const links = {};
            const lines = text.trim().split('\n');
            
            lines.forEach(line => {
                const [key, url] = line.split(': ');
                if (key && url) {
                    links[key.trim()] = url.trim();
                }
            });
            
            return links;
        } catch (error) {
            console.error(`שגיאה בטעינת לינקים ${path}:`, error);
            throw error;
        }
    }

    // טוען קובץ CSV וממיר אותו לאובייקט
    async loadCSV(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            const csvText = await response.text();
            
            return this.parseCSV(csvText);
        } catch (error) {
            console.error(`שגיאה בטעינת CSV ${path}:`, error);
            throw error;
        }
    }

    // פארסר לקבצי TSV (Tab-separated values) במקום CSV
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split('\t'); // שימוש בטאב במקום פסיק
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t'); // שימוש בטאב במקום פסיק
            const row = {};
            
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            data.push(row);
        }
        
        return data;
    }

    // מקבל מידע על הופעה ספציפית
    findArtistShow(artistName) {
        if (!this.loaded || !this.cache.venues) {
            console.warn('מידע עדיין לא נטען');
            return null;
        }

        // חיפוש בכל המתחמים
        for (const [venueName, venueData] of Object.entries(this.cache.venues)) {
            if (!Array.isArray(venueData)) continue;
            
            const show = venueData.find(row => 
                row['מי קורה'] && 
                row['מי קורה'].toLowerCase().includes(artistName.toLowerCase()) &&
                row['מה קורה'] === 'הופעה'
            );
            
            if (show) {
                return {
                    artist: show['מי קורה'],
                    date: show['תאריך'],
                    time: show['מתי קורה'],
                    venue: venueName,
                    venueHebrew: this.getVenueHebrew(venueName)
                };
            }
        }
        
        return null;
    }

    // תרגום שמות מתחמים לעברית
    getVenueHebrew(venueName) {
        const venueNames = {
            'mainStage': 'במת סמילנסקי',
            'danceStage': 'במת המחול',
            'redStage': 'הבמה האדומה',
            'elevatingStage': 'הבמה המרימה',
            'breakingPoint': 'Breaking Point'
        };
        return venueNames[venueName] || venueName;
    }

    // מקבל לוח זמנים ליום ספציפי
    getScheduleForDate(date) {
        if (!this.loaded || !this.cache.venues) return null;
        
        const daySchedule = {};
        
        for (const [venueName, venueData] of Object.entries(this.cache.venues)) {
            if (!Array.isArray(venueData)) continue;
            
            const dayShows = venueData.filter(row => 
                row['תאריך'] === date && row['מה קורה'] === 'הופעה'
            );
            
            if (dayShows.length > 0) {
                daySchedule[venueName] = dayShows.map(show => ({
                    artist: show['מי קורה'],
                    time: show['מתי קורה'],
                    venue: this.getVenueHebrew(venueName)
                }));
            }
        }
        
        return daySchedule;
    }

    // מקבל רשימת כל האמנים
    getAllArtists() {
        if (!this.loaded || !this.cache.venues) return [];
        
        const artists = new Set();
        
        for (const venueData of Object.values(this.cache.venues)) {
            if (!Array.isArray(venueData)) continue;
            
            venueData.forEach(row => {
                if (row['מה קורה'] === 'הופעה' && row['מי קורה']) {
                    artists.add(row['מי קורה']);
                }
            });
        }
        
        return Array.from(artists).sort();
    }

    // מקבל הודעת פתיחה
    getWelcomeMessage() {
        if (!this.loaded || !this.cache.welcomeMessage) {
            return 'היי! אני ASK סמילנסקי וברוך הבא לפסטיבל!';
        }
        return this.cache.welcomeMessage;
    }
    
    // מקבל לינקים שימושיים
    getUsefulLinks() {
        if (!this.loaded || !this.cache.usefulLinks) {
            return '';
        }
        return this.cache.usefulLinks;
    }
    
    // בדיקה אם המידע נטען
    isLoaded() {
        return this.loaded;
    }

    // מקבל מידע גולמי
    getRawData() {
        return this.cache;
    }

    // מחזיר לינק רלוונטי לפי הנושא
    getRelevantLink(question) {
        if (!this.loaded || !this.cache.usefulLinks) return null;
        
        const lowerQuestion = question.toLowerCase();
        
        // מקומות לינה
        if (lowerQuestion.includes('לינה') || lowerQuestion.includes('מלון') || 
            lowerQuestion.includes('ללון') || lowerQuestion.includes('לשינה') || 
            lowerQuestion.includes('מקום לשינה') || lowerQuestion.includes('לינה בסביבה')) {
            return {
                type: 'מקומות לינה',
                url: this.cache.usefulLinks['מקומות לינה'],
                text: 'מידע מפורט על מקומות לינה בסביבה יש כאן'
            };
        }
        
        // תוכנית מלאה
        if (lowerQuestion.includes('תוכנית') || lowerQuestion.includes('מלא') || 
            lowerQuestion.includes('הכל') || lowerQuestion.includes('שלם') || 
            lowerQuestion.includes('כל הפרטים') || lowerQuestion.includes('מפורט')) {
            return {
                type: 'תוכנית מלאה',
                url: this.cache.usefulLinks['תוכנית מלאה'],
                text: 'את התוכנית המלאה אתה יכול למצוא כאן'
            };
        }
        
        // דרכי הגעה
        if (lowerQuestion.includes('דרכי הגעה') || lowerQuestion.includes('איך להגיע') || 
            lowerQuestion.includes('אוטובוס') || lowerQuestion.includes('תחבורה') || 
            lowerQuestion.includes('איך מגיעים') || lowerQuestion.includes('איך אוכל להגיע')) {
            return {
                type: 'דרכי הגעה',
                url: this.cache.usefulLinks['דרכי הגעה'],
                text: 'מידע על דרכי הגעה בתחבורה ציבורית יש כאן'
            };
        }
        
        // מיקום הפסטיבל
        if (lowerQuestion.includes('איפה') || lowerQuestion.includes('מיקום') || 
            lowerQuestion.includes('כתובת') || lowerQuestion.includes('מקום') || 
            lowerQuestion.includes('איפה זה') || lowerQuestion.includes('איפה מתקיים')) {
            return {
                type: 'מיקום הפסטיבל',
                url: this.cache.usefulLinks['מיקום הפסטיבל'],
                text: 'מיקום הפסטיבל בגוגל מפות'
            };
        }
        
        return null;
    }
}

// ייצוא לשימוש גלובלי
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
}