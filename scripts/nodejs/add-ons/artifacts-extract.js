// To extract artifacts locally. Is not part of test.

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const glob = require('glob');

const sourceDir = './artifacts-download';
const targetDir = './artifacts-extract';

// Create target directory if it doesn't exist
fs.mkdirSync(targetDir, { mode: 0o755, recursive: true });

// Get all zip files in source directory
const zipFiles = glob.sync(path.join(sourceDir, '*.zip'));

zipFiles.forEach(zipFile => {
    const zip = new AdmZip(zipFile);
    const extractDir = path.join(targetDir, path.parse(zipFile).name);

    // Create subdirectory for each zip file
    fs.mkdirSync(extractDir, { mode: 0o755, recursive: true });

    // Extract contents
    zip.extractAllTo(extractDir, true);
    console.log(`Extracted: ${path.basename(zipFile)}`);
});

console.log("Extraction complete.");
