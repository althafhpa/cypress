// For GitHub workflow yml file. 
// In our case, we are not using this but using generate-matrix-config-chunks.js.
// Split the URLs into chunks and write each chunk to a separate file.
// Then update the config.json with the number of files and the number of URLs per file.
// The number of files = the number of runners in GitHub actions.
// This file will suit running workflow yml file with multiple runners once.
// Please update numFiles as needed.

const fs = require('fs');
const path = require('path');

// Read the URLs from the main file
const urlsFilePath = path.join('cypress', 'fixtures', 'urls.json');
const urlsData = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));

// Number of files to split into.
// This will also set number of concurrent jobs in GitHub actions.
// TO DO: THIS SHOULD COME FROM AN ENVIRONMENT VARIABLE
const numFiles = 25;

// Calculate the number of URLs per file
const urlsPerFile = Math.ceil(urlsData.length / numFiles);

// Create the urls directory if it does not exist
const urlsDirPath = path.join('cypress', 'fixtures', 'urls');
if (!fs.existsSync(urlsDirPath)) {
    fs.mkdirSync(urlsDirPath);
}

// Split the URLs into chunks and write each chunk to a separate file
let actualNumFiles = 0;
for (let i = 0; i < numFiles; i++) {
    const start = i * urlsPerFile;
    const end = start + urlsPerFile;
    const urlsChunk = urlsData.slice(start, end);

    if (urlsChunk.length > 0) {
        const outputFilePath = path.join(urlsDirPath, `urls-${i + 1}.json`);
        fs.writeFileSync(outputFilePath, JSON.stringify(urlsChunk, null, 2));
        actualNumFiles++;
    }
}

// Generate the configuration list
const config = {
    include: Array.from({ length: actualNumFiles }, (_, i) => ({
        urls_file: `urls-${i + 1}.json`
    }))
};

// Create the config.json file if it does not exist
const configFilePath = path.join(urlsDirPath, 'config.json');
if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, '');
}

// Save the configuration to the config.json file
fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

// Print the configuration
console.log(JSON.stringify(config, null, 2));
