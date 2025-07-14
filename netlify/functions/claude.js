const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// טוען מידע מקבצי data/
async function loadAllData() {
    try {
        console.log('🔄 טוען מידע מקבצי data/...');
        
        const data = {};
        
        // טוען מידע כללי על הפסטיבל
        data.festivalInfo = await fs.readFile(path.join(__dirname, '../../data/festival_info/fest_info.txt'), 'utf8');
        
        // טוען סגנון וטון
        data.styleTone = await fs.readFile(path.join(__dirname, '../../data/style_tone/style_tone.txt'), 'utf8');
        
        // טוען הודעת פתיחה
        data.welcomeMessage = await fs.readFile(path.join(__dirname, '../../data/welcome_message.txt'), 'utf8');
        
        // טוען לוחות זמנים מכל המתחמים
        data.venues = {};
        data.venues.mainStage = await loadCSV(path.join(__dirname, '../../data/venues/במת_סמילנסקי.csv'));
        data.venues.danceStage = await loadCSV(path.join(__dirname, '../../data/venues/במת_המחול.csv'));
        data.venues.redStage = await loadCSV(path.join(__dirname, '../../data/venues/הבמה_האדומה.csv'));
        data.venues.elevatingStage = await loadCSV(path.join(__dirname, '../../data/venues/הבמה_המרימה.csv'));
        data.venues.breakingPoint = await loadCSV(path.join(__dirname, '../../data/venues/breaking_point.csv'));
        
        console.log('✅ כל המידע נטען בהצלחה מקבצי data/');
        return data;
    } catch (error) {
        console.error('❌ שגיאה בטעינת מידע מקבצי data/:', error);
        throw error;
    }
}

// טוען קובץ CSV וממיר אותו לאובייקט
async function loadCSV(filePath) {
    try {
        const csvText = await fs.readFile(filePath, 'utf8');
        return parseCSV(csvText);
    } catch (error) {
        console.error(`שגיאה בטעינת CSV ${filePath}:`, error);
        throw error;
    }
}

// פארסר מתקדם ל-CSV שמטפל נכון במירכאות ופסיקים
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    // פארס את השורה הראשונה להשגת הכותרות
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        });
        
        data.push(row);
    }
    
    return data;
}

// פונקציה לפארס שורה יחידה ב-CSV עם תמיכה במירכאות
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
            current += char;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // הוסף את הערך האחרון
    result.push(current);
    
    return result;
}

// יוצר prompt מלא עם כל המידע בטון נכון
function createFullSystemPrompt(data, userMessage) {
    // מעצב את לוחות הזמנים בצורה טבעית
    let venuesText = '';
    for (const [venueName, venueData] of Object.entries(data.venues)) {
        if (Array.isArray(venueData) && venueData.length > 0) {
            const venueHebrew = getVenueHebrew(venueName);
            venuesText += `\n\n${venueHebrew}:\n`;
            venueData.forEach(show => {
                if (show['מה קורה'] === 'הופעה' && show['מי קורה']) {
                    venuesText += `• ${show['מי קורה']} - ${show['תאריך']} ב-${show['מתי קורה']}\n`;
                }
            });
        }
    }
    
    return `אתה בוט AI עבור פסטיבל סמילנסקי - פסטיבל המוזיקה והאמנות הכי חם בבאר שבע!

${data.styleTone}

===== מידע על הפסטיבל =====
${data.festivalInfo}

===== לוח הופעות =====
${venuesText}

===== הודעת פתיחה =====
${data.welcomeMessage}

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

        // Load festival data from files
        const festivalData = await loadAllData();
        
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
