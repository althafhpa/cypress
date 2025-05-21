// Used in GitHub workflow yml file. 
// This is requied to merge json files created in each runner.
// Merge Visual Diff JSON files in a directory to one JSON file.
// Updates the name of the test to the path to the comparison URL.
// Adds host to baselinePath, diffPath, comparisonPath to index.json defined in  cypress.env.json.

const fs = require('fs');
const path = require('path');
const cypressEnvFilePath = './cypress.env.json';

// Read the Cypress environment variables
fs.readFile(cypressEnvFilePath, 'utf8', (err, cypressEnvData) => {
    if (err) {
        console.error('Error reading Cypress environment variables:', err);
        return;
    }

    const cypressEnv = JSON.parse(cypressEnvData);

    // Directory paths
    const diffDir = `./public/visual-diff`;
    const jsonDir = path.join(diffDir, 'json');
    const mergeDir = path.join(diffDir, 'merge');

    let total = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSuites = 0;
    let jsonData = [];
    let jsonSuitesTests = []; // Initialize the array to avoid undefined variable error

    // Ensure the merge directory exists
    if (!fs.existsSync(mergeDir)) {
        // Create the merge directory, set permissions and make it writable.
        // Permission is changed to 0755 after copying the files.
        fs.mkdirSync(mergeDir, { recursive: true });
        fs.chmodSync(mergeDir, 0o777);
    }

    function updateName(test) {
        // Read urls.json to get the mapping
        const urlsData = JSON.parse(fs.readFileSync('./cypress/fixtures/urls.json', 'utf8'));

        const testName = test.name;
        const comparisonPath = testName.replace('visual-diff.cy-', '').replace('-desktop-1000px', '').replace('-tablet-768px', '').replace('-mobile-414px', '');

        // Find the matching URL pair
        const urlPair = urlsData.find(url => url.comparison === comparisonPath);

        if (urlPair) {
            test.name = `Baseline: ${cypressEnv.baseline_url}/${urlPair.baseline} | Comparison: ${cypressEnv.comparison_url}/${urlPair.comparison}`;
        } else {
            test.name = `Baseline: ${cypressEnv.baseline_url}/${comparisonPath} | Comparison: ${cypressEnv.comparison_url}/${comparisonPath}`;
        }
    }

    const jsonFileCount = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json')).length;

    console.log(jsonFileCount)

    if (jsonFileCount === 0) {
        console.log("\n No json file found for Visual diff html merge!\n");
    } else if (jsonFileCount > 0) {
        // Loop through visual diff json files
        fs.readdirSync(jsonDir).forEach(file => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(jsonDir, file);
                console.log(filePath);
                const json = fs.readFileSync(filePath, 'utf8');
                jsonData = JSON.parse(json);

                if (jsonData.suites && jsonData.suites[0] && jsonData.suites[0].tests && jsonData.suites[0].tests.length > 0) {
                    jsonData.suites[0].tests.forEach(test => {
                        updateName(test);
                        jsonSuitesTests.push(test);
                    });

                    total += jsonData.total;
                    totalPassed += jsonData.totalPassed;
                    totalFailed += jsonData.totalFailed;
                    totalSuites += jsonData.totalSuites;
                }

            }
        });
        const jsonMergeData = {
            total,
            totalPassed,
            totalFailed,
            totalSuites,
            suites: [{
                name: "visual-diff.cy.js",
                path: "cypress/e2e/visual-diff.cy.js",
                tests: jsonSuitesTests
            }],
            // Just using last updated json.
            startedAt: jsonData.startedAt,
            duration: jsonData.duration,
            endedAt: jsonData.endedAt,
            browserName: jsonData.browserName,
            browserVersion: jsonData.browserVersion,
            cypressVersion: jsonData.cypressVersion
        };

        const jsonDiffUpdated = JSON.stringify(jsonMergeData, null, 2);
        // Put merged json data.
        fs.writeFileSync(path.join(mergeDir, 'index.json'), jsonDiffUpdated);

        console.log("\nVisual diff html reports merged!\n");
    }
});
