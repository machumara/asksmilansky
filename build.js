const fs = require('fs');

// Simple build script that forces Netlify to build
console.log('Building ASK Smilansky...');
console.log('Functions should be available at netlify/functions/');

// Check if functions exist
if (fs.existsSync('./netlify/functions/claude.js')) {
    console.log('✅ claude.js function found');
} else {
    console.log('❌ claude.js function NOT found');
}

console.log('Build completed!');
