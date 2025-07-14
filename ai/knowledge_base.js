// מאגר הידע של דוקטור סמילנסקי
const FESTIVAL_KNOWLEDGE = {
    // מידע בסיסי על הפסטיבל
    basic_info: {
        name: "פסטיבל סמילנסקי",
        year: 2025,
        anniversary: 20, // שנה ה-20!
        dates: "26-28 באוגוסט 2025",
        location: "העיר העתיקה באר שבע",
        hours: "19:30-23:00",
        entrance: "חופשית",
        venues_count: 9,
        after_party: {
            date: "28.8.25",
            location: "פסאז' אוניקו",
            time: "אחרי 23:00 ואל תוך הלילה"
        }
    },

    // היסטוריה
    history: {
        founded: 2006,
        founders: "קבוצת שבא - אורן עמית, בתי רוטנשטרייך, שירה חן צחור, אילנא קוריאל, דויד פרץ, שגית בכר ותומר ירון",
        origin: "יוזמה עצמאית חתרנית של קבוצת אמנים ויזמי תרבות",
        evolution: "אומץ על ידי עיריית באר-שבע ואגף האירועים של חברת כיוונים"
    },

    // אמנים 2025
    artists_2025: {
        headliners: ["נטע ברזילי", "אביב גדג'", "מרגול", "עטר מיינר"],
        main_stage: {
            "26.8.25": [
                {artist: "אמיר ישראל", time: "20:15-20:45"},
                {artist: "מטאטא השמד", time: "21:00-21:45"},
                {artist: "שאזאמאט מארחים את ילד", time: "22:00-23:00"}
            ],
            "27.8.25": [
                {artist: "שירה וייסלר", time: "20:15-20:45"},
                {artist: "יוגב גלוסמן", time: "21:00-21:45"},
                {artist: "אביב גדג'", time: "22:00-23:00"}
            ],
            "28.8.25": [
                {artist: "אברהם לגסה", time: "20:15-20:45"},
                {artist: "בלולו", time: "21:00-21:45"},
                {artist: "עטר מיינר", time: "22:00-23:00"}
            ]
        },
        all_artists: [
            "אביב גדג'", "עטר מיינר", "נטע ברזילי", "מרגול",
            "שאזאמאט .FT ילד", "Yemen Blues", "תומר ישעיהו", "כהן",
            "HARD CLIMAX", "בלובנד - מופע איחוד", "בלולו", "יוגב גלוסמן",
            "מטאטא השמד", "אברהם לגסה", "סולג'יי", "שירה וייסלר",
            "אמיר ישראל", "דוד לב ארי", "YISHAY TRUE", "Kvisa", "Aziz Léon",
            "גוזל", "זיו שביט", "ארז פרביאש", "איירו", "להקת כפיים",
            "Moses Brass Bend", "Brasstet", "תיאטרון הקומץ", "SUE ME",
            "נעמי כץ", "מיקה קופפר", "אווה אסיאלוב", "עירד אבני"
        ]
    },

    // מתחמים
    venues: [
        "במת סמילנסקי", "הבמה המרימה", "הבמה האדומה", 
        "במת המחול", "במת הילדים", "מתחם האוכל", 
        "מתחם מהחלל", "שוק יוצרים", "מופעי רחוב"
    ],

    // תכניות מיוחדות
    special_programs: {
        kids: "מופעי קרקס ולהטוטנים, הצגות ילדים, הופעות מוזיקליות עם שירי ילדות",
        dance: "במת המחול עם יוצרים מהחוד החי של סצנת המחול העצמאית",
        hard_climax: "פרויקט מקורי - שחזור סצנת מסיבה מתוך הסרט Climax של גספר נואה",
        space_zone: "מתחם מהחלל - פעילויות בנושא החלל והכוכבים בשיתוף פארק קרסו למדע"
    },

    // קישורים
    links: {
        website: "https://www.bouras.co.il/smilansky",
        facebook: "https://www.facebook.com/SmilanskyFest/",
        instagram: "https://www.instagram.com/smilanskyfest/",
        tiktok: "https://www.tiktok.com/@smilanskyfestb7"
    }
};

// סגנון השפה והטון
const PERSONALITY_TRAITS = {
    tone: "צעיר, חם, אנרגטי, מקומי",
    language_style: [
        "שימוש בסלנג ישראלי",
        "ביטויים כמו 'וואלק', 'מה נסגר?', 'נו באמת'",
        "התלהבות רבה עם סימני קריאה",
        "תחושה של חברות וקהילה",
        "הומור וקלילות",
        "גאווה בפסטיבל ובעיר באר שבע"
    ],
    responses_style: [
        "מתחיל תשובות בחמימות",
        "משתמש באימוג'ים בשיקול דעת",
        "נותן מידע מדויק אבל בטון נינוח",
        "מציע קישורים כשרלוונטי",
        "מעודד השתתפות ומביע התרגשות"
    ]
};

// פונקציות עזר
const HELPER_FUNCTIONS = {
    // חיפוש אמן לפי תאריך
    findArtistByDate: (date) => {
        const schedule = FESTIVAL_KNOWLEDGE.artists_2025.main_stage[date];
        return schedule || null;
    },

    // חיפוש מידע על אמן
    findArtistInfo: (artistName) => {
        const allArtists = FESTIVAL_KNOWLEDGE.artists_2025.all_artists;
        const found = allArtists.find(artist => 
            artist.toLowerCase().includes(artistName.toLowerCase()) ||
            artistName.toLowerCase().includes(artist.toLowerCase())
        );
        return found || null;
    },

    // קבלת מידע על יום מסוים
    getDayInfo: (date) => {
        return FESTIVAL_KNOWLEDGE.artists_2025.main_stage[date] || null;
    }
};

// ייצוא המידע
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FESTIVAL_KNOWLEDGE, PERSONALITY_TRAITS, HELPER_FUNCTIONS };
} else {
    window.FESTIVAL_KNOWLEDGE = FESTIVAL_KNOWLEDGE;
    window.PERSONALITY_TRAITS = PERSONALITY_TRAITS;
    window.HELPER_FUNCTIONS = HELPER_FUNCTIONS;
}