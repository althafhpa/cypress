// To download, extract and merge artifacts locally. Is not part of test.

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const glob = require('glob');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('comparison-run-id', {
        description: 'GitHub Actions comparison run ID',
        required: true
    })
    .argv;

// Update below values based on your github settings.
const API_URL = "https://api.github.com";
//const TOKEN = process.env.GITHUB_TOKEN;
const TOKEN = ""; // Replace with your GitHub token
const OWNER = "xyz"; // Replace with your GitHub username or organization
const REPO = "cypress-automation"; // Replace with your GitHub repository name

async function downloadArtifacts() {
    fs.mkdirSync('./artifacts-download', { recursive: true });
    const artifactsUrl = `${API_URL}/repos/${OWNER}/${REPO}/actions/runs/${argv.comparisonRunId}/artifacts`;
    const response = await axios.get(artifactsUrl, {
        headers: {
            "Authorization": `token ${TOKEN}`,
            "Accept": "application/vnd.github.v3+json"
        }
    });

    for (const artifact of response.data.artifacts) {
        if (artifact.name.startsWith('reports-runner-urls-')) {
            const downloadUrl = artifact.archive_download_url;
            const response = await axios.get(downloadUrl, {
                headers: {
                    "Authorization": `token ${TOKEN}`,
                    "Accept": "application/vnd.github.v3+json"
                },
                responseType: 'arraybuffer'
            });
            const filePath = path.join('./artifacts-download', `${artifact.name}.zip`);
            fs.writeFileSync(filePath, response.data);
        }
    }
}

function extractArtifacts() {
    const zipFiles = glob.sync('./artifacts-download/*.zip');
    zipFiles.forEach(zipFile => {
        const zip = new AdmZip(zipFile);
        const extractPath = path.join('./artifacts-extracted', path.basename(zipFile, '.zip'));
        zip.extractAllTo(extractPath, true);
    });
}

function mergeArtifacts() {
    const extractedDirs = glob.sync('./artifacts-extracted/*');
    const targetDir = './public/visual-diff';
    fs.mkdirSync(targetDir, { recursive: true });

    // Rename and merge report JSON files
    extractedDirs.forEach(dir => {
        const jsonFiles = glob.sync(`${dir}/visual-diff/json/report-*.json`);
        jsonFiles.forEach(jsonFile => {
            const fileName = path.basename(jsonFile);
            const newFileName = fileName.replace('.json', `-${argv.comparisonRunId}.json`);
            fs.copyFileSync(jsonFile, path.join(targetDir, 'json', newFileName));
        });
    });

    // Merge screenshot directories
    ['baseline', 'comparison', 'diff'].forEach(type => {
        const targetScreenshotDir = path.join(targetDir, 'screenshots', type);
        fs.mkdirSync(targetScreenshotDir, { recursive: true });

        extractedDirs.forEach(dir => {
            const sourceScreenshotDir = path.join(dir, 'visual-diff', 'screenshots', type);
            if (fs.existsSync(sourceScreenshotDir)) {
                const screenshots = fs.readdirSync(sourceScreenshotDir);
                screenshots.forEach(screenshot => {
                    fs.copyFileSync(
                        path.join(sourceScreenshotDir, screenshot),
                        path.join(targetScreenshotDir, screenshot)
                    );
                });
            }
        });
    });
}

async function main() {
    await downloadArtifacts();
    extractArtifacts();
    mergeArtifacts();
}

main().catch(console.error);
