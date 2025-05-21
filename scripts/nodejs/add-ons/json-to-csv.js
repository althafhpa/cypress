// JSON to CSV conversion. Not part of test.

const fs = require('fs');
const path = require('path');

// Read JSON file
const jsonData = JSON.parse(fs.readFileSync(path.join('cypress', 'fixtures', 'urls-lighthouse-optimizely.json')));

// Extract only comparison paths and create CSV content
const csvHeader = 'url\n';
const csvContent = jsonData.map(item => item.comparison).join('\n');

// Write to CSV file
const outputPath = path.join('cypress', 'fixtures', 'urls-lighthouse-optimizely.csv');
fs.writeFileSync(outputPath, csvHeader + csvContent);

console.log(`CSV file created at: ${outputPath}`);
