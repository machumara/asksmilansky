const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// טוען מידע מקבצי data/ דרך HTTP במקום file system
async function loadAllData(baseUrl) {
    try {
        console.log('🔄 טוען מידע מקבצי data/ דרך HTTP...');
        console.log('Base URL:', baseUrl);
        
        const data = {};
        
        // טוען מידע כללי על הפסטיבל
        const festivalResponse = await fetch(`${baseUrl}/data/festival_info/fest_info.txt`);
        if (!festivalResponse.ok) throw new Error(`Failed to fetch festival info: ${festivalResponse.status}`);
        data.festivalInfo = await festivalResponse.text();
        console.log('✅ Festival info loaded');
        
        // טוען סגנון וטון
        const styleResponse = await fetch(`${baseUrl}/data/style_tone/style_tone.txt`);
        if (!styleResponse.ok) throw new Error(`Failed to fetch style: ${styleResponse.status}`);
        data.styleTone = await styleResponse.text();
        console.log('✅ Style tone loaded');
        
        // טוען הודעת פתיחה
        const welcomeResponse = await fetch(`${baseUrl}/data/welcome_message.txt`);
        if (!welcomeResponse.ok) throw new Error(`Failed to fetch welcome: ${welcomeResponse.status}`);
        data.welcomeMessage = await welcomeResponse.text();
        console.log('✅ Welcome message loaded');
        
        // טוען לינקים שימושיים
        const linksResponse = await fetch(`${baseUrl}/data/links/useful_links.txt`);
        if (linksResponse.ok) {
            data.usefulLinks = await linksResponse.text();
            console.log('✅ Useful links loaded');
        } else {
            data.usefulLinks = '';
            console.log('⚠️ No useful links found');
        }
        
        // טוען לוחות זמנים מכל המתחמים
        data.venues = {};
        
        const mainStageResponse = await fetch(`${baseUrl}/data/venues/במת_סמילנסקי.csv`);
        if (mainStageResponse.ok) {
            data.venues.mainStage = parseCSV(await mainStageResponse.text());
            console.log('✅ Main stage loaded');
        }
        
        const danceStageResponse = await fetch(`${baseUrl}/data/venues/במת_המחול.csv`);
        if (danceStageResponse.ok) {
            data.venues.danceStage = parseCSV(await danceStageResponse.text());
            console.log('✅ Dance stage loaded');
        }
        
        const redStageResponse = await fetch(`${baseUrl}/data/venues/הבמה_האדומה.csv`);
        if (redStageResponse.ok) {
            data.venues.redStage = parseCSV(await redStageResponse.text());
            console.log('✅ Red stage loaded');
        }
        
        const elevatingStageResponse = await fetch(`${baseUrl}/data/venues/הבמה_המרימה.csv`);
        if (elevatingStageResponse.ok) {
            data.venues.elevatingStage = parseCSV(await elevatingStageResponse.text());
            console.log('✅ Elevating stage loaded');
        }
        
        const breakingPointResponse = await fetch(`${baseUrl}/data/venues/breaking_point.csv`);
        if (breakingPointResponse.ok) {
            data.venues.breakingPoint = parseCSV(await breakingPointResponse.text());
            console.log('✅ Breaking Point loaded');
        }
        
        console.log('✅ כל המידע נטען בהצלחה מקבצי data/');
        return data;
    } catch (error) {
        console.error('❌ שגיאה בטעינת מידע מקבצי data/:', error);
        throw error;
    }
}

// פארסר לקבצי TSV (Tab-separated values) במקום CSV
function parseCSV(csvText) {
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

// יוצר prompt מלא עם כל המידע בטון נכון
function createFullSystemPrompt(data, userMessage, relevantLink = null) {
    // מעצב את לוחות הזמנים בצורה מלאה ל-Claude
    let venuesText = '';
    for (const [venueName, venueData] of Object.entries(data.venues)) {
        if (Array.isArray(venueData) && venueData.length > 0) {
            const venueHebrew = getVenueHebrew(venueName);
            venuesText += `\n\n${venueHebrew}:\n`;
            venueData.forEach(show => {
                if (show['מה קורה'] === 'הופעה' && show['מי קורה']) {
                    // נותן ל-Claude את כל המידע כמו שהוא
                    venuesText += `• אמן: ${show['מי קורה']}`;
                    
                    // אם יש תיאור מפורט בעמודה "סוג" - מוסיף אותו במלואו
                    if (show['סוג'] && show['סוג'].trim()) {
                        const description = show['סוג'].trim();
                        // אם זה תיאור ארוך (יותר מ-50 תווים) - מוסיף אותו כתיאור מלא
                        if (description.length > 50) {
                            venuesText += `\n  תיאור מלא: ${description}`;
                        } else {
                            venuesText += ` | סוג: ${description}`;
                        }
                    }
                    
                    venuesText += ` | תאריך: ${show['תאריך']} | שעה: ${show['מתי קורה']}\n`;
                }
            });
        }
    }
    
    return `אתה ASK סמילנסקי - מישהו שמכיר את פסטיבל סמילנסקי 2025 בבאר שבע.

${data.styleTone}

השתמש במידע הטרי והמדויק שלך על הפסטיבל, אל תסתמך על ידע כללי על אמנים. אם מישהו שואל על משהו שלא בנתונים שלך - תגיד שאתה לא בטוח ותפנה לאתר הפסטיבל.

===== מידע על הפסטיבל =====
${data.festivalInfo}

===== לוח הופעות מלא =====
המידע למטה כולל את כל הפרטים על כל הופעה:
- אמן: שם האמן/להקה
- סוג: סוג המופע (ראפר, זמר יוצר, להקה, יצירת מחול, מופע לילדים וכו')
- תאריך ושעה

**PERSONALITY:**
- דבר כמו מישהו שמכיר את הפסטיבל טוב ויודע לתת מידע מועיל
- טון רגוע, ביטחון עצמי, קול אבל לא מתלהב יתר על המידה
- תשובות טבעיות וישירות (לא רשימות אלא אם באמת נחוץ!)
- הימנע מביטויים מפוצצים כמו וואו, מטורף, אש, אחי
- אל תשתמש באימוג'ים בכלל
- תן למידע לדבר בעד עצמו

USEFUL LINKS - לינקים שימושיים:
השתמש בלינקים האלה כשמתאים לשאלה:
${data.usefulLinks || 'לינקים לא זמינים'}

הנחיות לשימוש בלינקים (הפורמט החדש כולל זוגות של מילות מפתח ולינקים):
- אם שואלים על מקומות לינה, מלון, ללון בסביבה - תגיד "יש הרבה אפשרויות לינה בבאר שבע ובסביבה" ותפנה ללינק 'lodging' בלבד
- אם שואלים על התוכנית המלאה, תוכניות, הכל - תן מידע כללי ותפנה ללינק 'program'
- אם שואלים על דרכי הגעה, איך להגיע, אוטובוס - תן מידע כללי ותפנה ללינק 'transportation'
- אם שואלים איפה הפסטיבל, מיקום, כתובת - תגיד "הפסטיבל מתקיים בעיר העתיקה של באר שבע" ותפנה ללינק 'location'

חשוב! כללי לינקים וכללי תוכן:
- אל תמציא שמות מלונות, כתובות, או מקומות ספציפיים שלא בנתונים שלך
- אל תמליץ על מקומות או שירותים ספציפיים
- תמיד תן תשובה כללית ומועילה ואז פנה ללינק לפרטים
- חובה! לכל תשובה רק לינק אחד בלבד
- חובה! תמיד סיים את התשובה עם הלינק בשורה האחרונה
- פורמט חובה: [התשובה כאן]\n\nמידע נוסף: [לינק]
- הלינק חייב להיות הדבר האחרון בתשובה - שום דבר אחריו!

חשוב! פורמט לינקים:
- תמיד הציג לינקים בסוף התשובה בשורה נפרדת
- פורמט: "מידע נוסף: https://example.com"
- אל תשים טקסט אחרי לינקים - תמיד בסוף!
- הלינק צריך להיות בשורה נפרדת בסוף התשובה

שלב את הלינקים בצורה טבעית אבל תמיד בסוף התשובה, לא באמצע.

דיוק במידע על אמנים ובמות:
- כשאתה עונה על שאלות על אמנים - תמיד ציין במפורש באיזו במה הם מופיעים
- בדוק בקפידה את שם הבמה הנכון לכל אמן לפני שאתה עונה
- השתמש במידע המדויק מקבצי ה-CSV - אל תנחש או תערבב בין במות
- אם לא בטוח באיזו במה אמן מופיע - תגיד שאתה לא בטוח ותפנה לתוכנית המלאה

מניעת לינקים חוזרים:
- אל תוסיף לינק אם כבר נתת את אותו לינק במהלך השיחה הנוכחית
- תוסיף לינק רק אם המשתמש שואל מפורשות על מידע שדורש לינק חדש
- לא כל תשובה חייבת לסיים עם לינק - רק אם זה באמת רלוונטי ומועיל
- אם התשובה מלאה ומספקת ללא לינק - אל תוסיף לינק
- עדיף תשובה טובה בלי לינק מאשר תשובה עם לינק מיותר

השתמש במידע הזה כדי לענות נכון על שאלות על אמנים וסוגי מופעים.
${venuesText}

===== הודעת פתיחה =====
${data.welcomeMessage}

ענה בטון טבעי ורגוע כמו מישהו שפשוט יודע את העניין. תן מידע בצורה ישירה ומועילה בלי להפריז בהתלהבות. אל תשתמש בביטויים רשמיים או ביטויים מפוצצים. תן מידע בצורה זורמת וטבעית.

שאלת המשתמש: ${userMessage}`;
}

// תרגום שמות מתחמים לעברית
function getVenueHebrew(venueName) {
    const venueNames = {
        'mainStage': 'במת סמילנסקי',
        'danceStage': 'במת המחול', 
        'redStage': 'הבמה האדומה',
        'elevatingStage': 'הבמה המרימה',
        'breakingPoint': 'Breaking Point'
    };
    return venueNames[venueName] || venueName;
}

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only handle POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const requestData = JSON.parse(event.body);
        const { api_key, message, system_prompt, relevant_link } = requestData;

        // Get API key and model from environment variables
        const apiKey = process.env.CLAUDE_API_KEY || api_key;
        const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
        const maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS) || 1000;

        // Get base URL from request headers
        const host = event.headers.host;
        const protocol = event.headers['x-forwarded-proto'] || 'https';
        const baseUrl = `${protocol}://${host}`;
        
        // Load festival data from files
        const festivalData = await loadAllData(baseUrl);
        
        // Create full system prompt with all data - this replaces the client prompt
        const fullSystemPrompt = createFullSystemPrompt(festivalData, message, relevant_link);

        console.log('📥 Received request:');
        console.log('   Message:', message?.substring(0, 50) + '...');
        console.log('   API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'None');
        console.log('   Using SERVER prompt (not client prompt)');
        console.log('   Model:', model);
        console.log('   Max Tokens:', maxTokens);

        if (!apiKey || !message) {
            console.log('❌ Missing api_key or message');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing api_key or message' })
            };
        }

        // Prepare Claude API request
        const claudeData = {
            model: model,
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: message }]
        };

        // Add system prompt only if not empty
        if (fullSystemPrompt && fullSystemPrompt.trim()) {
            claudeData.system = fullSystemPrompt;
        }

        console.log('📤 Sending to Claude API...');

        // Send request to Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(claudeData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Claude API Error:', response.status, errorText);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: `Claude API Error ${response.status}: ${errorText}` 
                })
            };
        }

        const claudeResponse = await response.json();
        console.log('✅ Got response from Claude');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(claudeResponse)
        };

    } catch (error) {
        console.error('❌ Function Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
