#!/bin/bash

## Run Baseline Test Locally

## Clear Cache
npm cache clean --force
npm cache verify

## Run baseline Test
npx cypress run --config-file cypress.config-baseline.js --browser chrome --headless --spec './cypress/e2e/visual-diff.cy.js' --env URLS_FILE=urls-local.json
