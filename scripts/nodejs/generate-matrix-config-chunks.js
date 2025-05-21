// Used in GitHub workflow yml file. 
// Split the URLs into chunks defined by urlsPerFile and write each chunk to a separate file.
// The remaining URLs are saved in the main file.
// Then update the config.json with the number of files and the number of URLs per file.
// This file will suit to run the workflow yml multiple times either manually or using cron.
// Please update urlsPerFile and numFiles as needed.

const fs = require('fs');
const path = require('path');

// Read the URLs from the main file
const urlsFilePath = path.join('cypress', 'fixtures', 'urls.json');
const urlsData = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));

// Number of URLs per file.
// This will be the number of urls per job in GitHub actions.
const urlsPerFile = 30;

// Specify the number of files.
// This will also set number of concurrent jobs in GitHub actions.
const numFiles = 50; // Change this value as needed

// Create the urls directory if it does not exist
const urlsDirPath = path.join('cypress', 'fixtures', 'urls');
if (!fs.existsSync(urlsDirPath)) {
    fs.mkdirSync(urlsDirPath);
}

// Split the URLs into chunks and write each chunk to a separate file
let actualNumFiles = 0;
let remainingUrls = [...urlsData];

for (let i = 0; i < numFiles; i++) {
    const start = i * urlsPerFile;
    const end = start + urlsPerFile;
    const urlsChunk = remainingUrls.slice(0, urlsPerFile);

    if (urlsChunk.length > 0) {
        const outputFilePath = path.join(urlsDirPath, `urls-${i + 1}.json`);
        fs.writeFileSync(outputFilePath, JSON.stringify(urlsChunk, null, 2));
        actualNumFiles++;
    }

    // Remove the processed URLs from the remaining URLs
    remainingUrls = remainingUrls.slice(urlsPerFile);

    // If there are no more URLs left, break the loop
    if (remainingUrls.length === 0) {
        break;
    }
}

// Update the main urls.json with the remaining URLs
fs.writeFileSync(urlsFilePath, JSON.stringify(remainingUrls, null, 2));

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
