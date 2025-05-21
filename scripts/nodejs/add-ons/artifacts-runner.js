// To download and extract artifacts locally. Is not part of test.

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const AdmZip = require('adm-zip');
const { execSync } = require('child_process');

const argv = yargs(hideBin(process.argv))
    .option('baseline-run-id', {
        description: 'GitHub Actions run ID to download artifacts from'
    })
    .argv;

// Update below values based on your github settings
const API_URL = "https://api.github.com";
//const TOKEN = process.env.GITHUB_TOKEN;
const TOKEN = ""; // Replace with your GitHub token
const OWNER = "xyz"; // Replace with your GitHub username or organization
const REPO = "cypress-automation";
const RUN_ID = argv.baselineRunId; // Replace with the actual run ID you want to download artifacts from
const WORKSPACE_ROOT = process.cwd(); // Replace with the path to your workspace root

const headers = {
    "Authorization": `token ${TOKEN}`,
    "Accept": "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28"
};

async function downloadAndExtractArtifacts() {
    const artifactsUrl = `${API_URL}/repos/${OWNER}/${REPO}/actions/runs/${RUN_ID}/artifacts`;
    const response = await axios.get(artifactsUrl, { headers });
    const artifact = response.data.artifacts.find(a => a.name === 'baseline-visual-diff');

    const downloadResponse = await axios.get(artifact.archive_download_url, {
        headers,
        responseType: 'arraybuffer'
    });

    // Create the destination directory
    const baselineDir = path.join(WORKSPACE_ROOT, 'public');
    fs.mkdirSync(baselineDir, { recursive: true });

    // Extract directly to public directory
    const zip = new AdmZip(downloadResponse.data);
    zip.extractAllTo(baselineDir, true);

    console.log('Final directory structure:');
    console.log(execSync('ls -R ./public').toString());
}

downloadAndExtractArtifacts();
