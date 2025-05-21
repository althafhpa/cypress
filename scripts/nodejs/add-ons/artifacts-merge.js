// To merge artifacts locally. Is not part of test.

const fs = require('fs');
const path = require('path');

const sourceDir = './artifacts-extract';
const targetDir = './public/visual-diff/screenshots';

// Create target directory if it doesn't exist
fs.mkdirSync(targetDir, { mode: 0o755, recursive: true });

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const sourcePath = path.join(dir, file);
        const stats = fs.statSync(sourcePath);

        if (stats.isDirectory()) {
            walkDir(sourcePath);
        } else {
            // Get the path relative to the source directory
            const relPath = path.relative(sourceDir, sourcePath);

            // Only process files in the 'screenshots' directory within 'reports-runner-urls-*' folders
            if (relPath.includes('reports-runner-urls-') && relPath.includes('visual-diff/screenshots')) {
                // Remove 'reports-runner-urls-*' and 'visual-diff/screenshots' part from the path
                const cleanPath = relPath.split('visual-diff/screenshots/')[1];

                // Determine the correct target path
                const targetPath = path.join(targetDir, cleanPath);

                // Create target directories if they don't exist
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });

                // Copy file to the target directory
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`Merged: ${cleanPath}`);
            }
        }
    });
}

walkDir(sourceDir);
console.log("Merging complete.");
