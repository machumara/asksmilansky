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
function createFullSystemPrompt(data, userMessage) {
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
                    if (show['סוג'] && show['סוג'].trim()) {
                        venuesText += ` | סוג: ${show['סוג'].trim()}`;
                    }
                    venuesText += ` | תאריך: ${show['תאריך']} | שעה: ${show['מתי קורה']}\n`;
                }
            });
        }
    }
    
    return `אתה בוט AI עבור פסטיבל סמילנסקי - פסטיבל המוזיקה והאמנות הכי חם בבאר שבע!

${data.styleTone}

**חשוב מאוד: ענה רק על בסיס המידע שסופק לך למטה. אל תשתמש בידע כללי שלך על אמנים או להקות. אם אין מידע על משהו ספציפי בנתונים שלמטה - אמור שאתה לא יודע ותפנה לאתר הפסטיבל.**

===== מידע על הפסטיבל =====
${data.festivalInfo}

===== לוח הופעות מלא =====
המידע למטה כולל את כל הפרטים על כל הופעה:
- אמן: שם האמן/להקה
- סוג: סוג המופע (ראפר, זמר יוצר, להקה, יצירת מחול, מופע לילדים וכו')
- תאריך ושעה

השתמש במידע הזה כדי לענות נכון על שאלות על אמנים וסוגי מופעים.
${venuesText}

===== הודעת פתיחה =====
${data.welcomeMessage}

**הוראות חשובות:**
1. ענה רק על בסיס המידע שסופק למעלה
2. אם שואלים על אמן/להקה שלא מופיע ברשימה - אמור שהם לא מופיעים בפסטיבל
3. אל תשתמש בידע כללי שלך על אמנים - רק מה שכתוב בנתונים
4. אם אין מידע מפורט על משהו - הפנה לאתר הפסטיבל

ענה בטון אנושי וטבעי, כאילו אתה מדבר עם חבר שמתעניין בפסטיבל. היה ישיר, עניינתי, ובעל מידע. אל תשתמש בסיסמאות שיווקיות או בביטויים מתנפחים. אל תשתמש באימוג'ים. תן מידע מועיל בצורה נינוחה וחברותית, כמו שמישהו מקומי היה מסביר לך על הפסטיבל.

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
        const { api_key, message, system_prompt } = requestData;

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
        
        // Create full system prompt with all data
        const fullSystemPrompt = createFullSystemPrompt(festivalData, message);

        console.log('📥 Received request:');
        console.log('   Message:', message?.substring(0, 50) + '...');
        console.log('   API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'None');
        console.log('   System Prompt Length:', system_prompt?.length || 0);
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
