describe('oEmbed Visual Regression', () => {
    const urlsFile = Cypress.env('URLS_FILE');
    const data = require(`../fixtures/urls/${urlsFile}`);

    beforeEach(function () {
        // Continue testing on failure. Reports will have failure details.
        cy.on('fail', (err, runnable) => {
            return false;
        });

        // Prevent Cypress from failing from application error.
        // For ex. if console shows js errors test fails.
        cy.on('uncaught:exception', (err, runnable) => {
            // To Do. Add to failed json.
            return false;
        });

       if(Cypress.config().baseUrl !== Cypress.env('BASELINE_URL')) {
            cy.oktaLogin(Cypress.env('OKTA_USERNAME'), Cypress.env('OKTA_PASSWORD'), Cypress.env('OKTA_ANSWER'), Cypress.env('OKTA_DOMAIN'));
        }

    });

    data.forEach(pageObj => {

        // Specify Image name to match url path of comparison url path.
        // Must be same image name for baseline and comparison.
        let image = pageObj.comparison;
        // Test name and test image name.
        let testName = `${image}-${pageObj.device}-${pageObj.width}px`;

        it(`${Cypress.config().baseUrl}/${pageObj.comparison} | ${testName}`, function () {
            // Set viewport.
            cy.viewport(pageObj.width, pageObj.height);

            if(Cypress.config().baseUrl === Cypress.env('BASELINE_URL')) {
                cy.log(`Baseline screenshot for ${testName}`);
                _baselineScreenshot(
                    pageObj.baseline,
                    testName
                );
            }
            else {
                _comparisonScreenshotAndCompare(
                    pageObj.comparison,
                    testName
                );
            }

        });
    });
});

/**
 * Function for handling baseline screenshots.
 *
 * @param {string} path - The path to the screenshot.
 * @param {string} testName - The name of the test.
 */
function _baselineScreenshot(path, testName) {
    cy.visit(Cypress.env('BASELINE_URL') + '/' + path, {
        auth: {
            username: Cypress.env('HTTP_AUTH_USERNAME'),
            password: Cypress.env('HTTP_AUTH_PASSWORD')
        },
        failOnStatusCode: false,
        testIsolation: false,
    });

    cy.get('body').then($body => {
        // Hide elements that may cause visual differences.
        hideElements($body, 'baseline');

        // Take screenshots.
        _takeScreenshot(testName);
    });
}

/**
 * Function for comparing screenshots.
 *
 * @param {string} path - The path to the screenshot.
 * @param {string} testName - The name of the test.
 */
function _comparisonScreenshotAndCompare(path, testName) {
    cy.visit(Cypress.config().baseUrl + '/' + path, {
        failOnStatusCode: false
    });

    cy.get('body').then($body => {
        // Hide elements that may cause visual differences.
        hideElements($body, 'comparison');

        // Take screenshots.
        _takeScreenshot(testName);
    });
}

/**
 * Takes a screenshot of the current page and compares it to a previously taken snapshot.
 *
 * @param {string} testName - The name of the test case.
 * @return {Promise<void>} - A promise that resolves when the screenshot has been taken and compared.
 */
function _takeScreenshot(testName) {
    return new Promise((resolve, reject) => {
        cy.wait(1000);

        cy.get('body').then(($body) => {
            const contentMainExists = $body.find('[data-block="content-main"]').length > 0;
            cy.log(`Found ${contentMainExists ? 'an' : 'no'} element with selector '[data-block="content-main"]'`);

            try {
                if (contentMainExists) {
                    cy.log(`Taking screenshot of '[data-block="content-main"]'`);
                    cy.get('[data-block="content-main"]')
                        .compareSnapshot({
                            name: testName,
                            capture: 'viewport',
                            errorThreshold: 0.05
                        })
                        .then(() => resolve());
                } else {
                    cy.log(`'[data-block="content-main"]' not found. Taking full page screenshot.`);
                    cy.compareSnapshot({
                        name: testName
                    })
                        .then(() => resolve());
                }
            } catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * Hides elements or set css styles that may cause visual differences in screenshots.
 *
 * @param {Object} $body - The body element of the page.
 * @param testType - The type of test being run (baseline or comparison).
 */
function hideElements($body, testType) {

    if (testType === 'comparison') {

        // Fixes image distortion while taking screenshot.
        cy.get("html, body").invoke(
            "attr",
            "style",
            "height: auto; scroll-behavior: auto; overflow: hidden;"
        );

        if ($body.find('.layoutContainer').length) {
            cy.get('.layoutContainer').invoke('attr', 'style', `padding-left: 0;padding-right: 0;`);
        }

        if ($body.find('.back-button').length) {
            cy.get('a[data-back="1"]').hideElement();
        }

        if ($body.find('.cta').length) {
            cy.get('.cta').hideElement();
        }
        
        if ($body.find('#main-nav').length) {
            cy.get('#main-nav').hideElement();
        }
    }
    else {

        // Hide header. Since it is not part of oembed.
        if ($body.find('.header').length) {
            cy.get('.header').hideElement();
        }

        // Hide breadcrumb. Since it is not part of oembed.
        if ($body.find('.breadcrumbs').length) {
            cy.get('.breadcrumbs').hideElement();
        }

        // Hide sidebar. Since it is not part of oembed.
        if ($body.find('.sidebar-grid').length) {
            cy.get('.sidebar-grid').hideElement();
        }
    }
}
