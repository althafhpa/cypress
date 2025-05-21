// To download artifacts 

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('baseline-run-id', {
        description: 'GitHub Actions run ID to download artifacts from'
    })
    .argv;

// Update below values based on your github settings.
const API_URL = "https://api.github.com";
//const TOKEN = process.env.GITHUB_TOKEN;
const TOKEN = ""; // Replace with your GitHub token
const OWNER = ""; // Replace with your GitHub username or organization
const REPO = ""; // Replace with your GitHub repository name
const RUN_ID = argv.baselineRunId; // Replace with the actual run ID you want to download artifacts from

const headers = {
    "Authorization": `token ${TOKEN}`,
    "Accept": "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28"
};

async function downloadArtifacts() {
    fs.mkdirSync('./artifacts-download', { recursive: true });

    let allArtifacts = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const artifactsUrl = `${API_URL}/repos/${OWNER}/${REPO}/actions/runs/${RUN_ID}/artifacts`;
        try {
            const response = await axios.get(artifactsUrl, {
                headers,
                params: { page, per_page: perPage }
            });

            if (response.data.artifacts) {
                allArtifacts.push(...response.data.artifacts);
                if (response.data.artifacts.length < perPage) break;
                page++;
            } else {
                console.log("No artifacts found in the response. Full response:");
                console.log(response.data);
                break;
            }
        } catch (error) {
            console.error('Error fetching artifacts:', error.response?.data || error.message);
            throw error;
        }
    }

    for (const artifact of allArtifacts) {
        if (artifact.name.startsWith('reports-runner-urls-')) {
            const downloadUrl = artifact.archive_download_url;
            try {
                const response = await axios.get(downloadUrl, {
                    headers,
                    responseType: 'arraybuffer'
                });

                if (response.status === 200) {
                    const filePath = path.join('./artifacts-download', `${artifact.name}.zip`);
                    fs.writeFileSync(filePath, response.data);
                    console.log(`Downloaded: ${artifact.name}.zip`);
                } else {
                    console.log(`Failed to download: ${artifact.name}.zip`);
                }
            } catch (error) {
                console.error(`Error downloading ${artifact.name}:`, error.response?.data || error.message);
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

downloadArtifacts().catch(console.error);
