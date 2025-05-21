#!/bin/bash

## Run Comparison Test Locally

## Clear Cache
npm cache clean --force
npm cache verify

## Run comparison Test
npx cypress run --browser chrome --headless --spec './cypress/e2e/visual-diff.cy.js' --env URLS_FILE=urls-local.json