// To generate local-urls.json for local testing. 
// This Optional, You can manually add or update local-urls.json.

const fs = require('fs');
const path = require('path');

// Read the URLs from the main file
const urlsFilePath = path.join('cypress', 'fixtures', 'urls.json');
const urlsData = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));

// Specify the number of URLs to test
const numUrlsToTest = 10; // Change this value as needed

// Select the specified number of URLs to test
const urlsToTest = urlsData.slice(0, numUrlsToTest);

// Save the selected URLs to urls-test.json
const urlsTestFilePath = path.join('cypress', 'fixtures', 'urls', 'urls-local.json');
fs.writeFileSync(urlsTestFilePath, JSON.stringify(urlsToTest, null, 2));

console.log(`Saved ${numUrlsToTest} URLs to ${urlsTestFilePath}`);
