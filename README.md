# ASK Smilansky Festival AI Bot

בוט AI חכם לפסטיבל סמילנסקי שיכול לענות על שאלות על התוכנית, מיקומים, זמנים ועוד.

## 🚀 Deploy לNetlify

### שלב 1: הכנת הקבצים
✅ כל הקבצים מוכנים לdeployment!

### שלב 2: העלאה לNetlify
1. **גרירה ישירה**: גרור את כל התיקייה לNetlify (ללא ZIP)
2. **או דרך Git**: העלה לGitHub ואז קשר לNetlify

### שלב 3: הגדרת API Key
1. לך לdashboard של הsite בNetlify
2. **Site settings** → **Environment variables**
3. הוסף משתנה חדש:
   - **Key**: `CLAUDE_API_KEY`
   - **Value**: המפתח שלך מClaude API
4. **Save** ו-**Deploy site** מחדש

### שלב 4: בדיקה
- הsite יהיה זמין ב: `https://your-site-name.netlify.app`
- בדוק שהבוט עובד כמו במקומי

## 🔧 פיתוח מקומי

```bash
# התקן dependencies
npm install

# הרץ development server
npm run dev
```

## 📁 מבנה הפרויקט

```
├── index.html              # דף הבית
├── script.js, style.css    # קבצי frontend
├── ai/                     # מנוע הAI
├── config/                 # הגדרות
├── data/                   # מידע הפסטיבל
├── dev/                    # כלי פיתוח
├── netlify/functions/      # Netlify Functions
└── netlify.toml           # הגדרות Netlify
```

## 🎯 שלבים עתידיים

- [ ] שתי גרסאות (רגיל + dev)
- [ ] Google Search API
- [ ] הטמעה בוויקס

## 📞 תמיכה

בעיות? בדוק את הconsole בדפדפן ואת הlogs בNetlify Functions.
