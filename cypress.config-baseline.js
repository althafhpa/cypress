const { defineConfig } = require("cypress");
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/plugin");
const fs = require('fs');

module.exports = defineConfig({
  e2e: {
    // Block any urls that we don't want to run in Test.
    blockHosts: [
      "*.google-analytics.com",
      "*.facebook.net",
      "*.googletagmanager.com",
      "*.tiktok.com",
    ],
    baseUrl: "https://www.google.com",// Replace with your base URL
    failOnStatusCode: false,
    video: false,
    chromeWebSecurity: false,
    testIsolation: false,
    experimentalMemoryManagement: true,
    setupNodeEvents(on, config) {
      return getCompareSnapshotsPlugin(on, config);
    },
  },
  env: {
    // Add environment variables in cypress.env.json
  },
  projectId: "",
});
