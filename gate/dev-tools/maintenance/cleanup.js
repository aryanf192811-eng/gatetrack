const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'public', 'index.html');
let lines = fs.readFileSync(file, 'utf-8').split('\n');
lines.splice(2727, 2920 - 2728 + 1); // 0-indexed: lines 2728 to 2920 inclusive
fs.writeFileSync(file, lines.join('\n'), 'utf-8');
console.log('Removed duplicate lines.');
