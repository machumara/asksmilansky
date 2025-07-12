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

    // פארסר פשוט ל-CSV
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
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
    
    // בדיקה אם המידע נטען
    isLoaded() {
        return this.loaded;
    }

    // מקבל מידע גולמי
    getRawData() {
        return this.cache;
    }
}

// ייצוא לשימוש גלובלי
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
}