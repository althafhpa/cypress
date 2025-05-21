#!/bin/bash

## Run Test Report Locally

## Merge Visual Diff JSON
## Not Required in local
## Required in GitHub Test with multiple runners


## Merge reports from json files in json directory to single report index.json under merge directory
## This is required when running multiple runners in GitHub Actions
## We still copy single json file to merge/index.json for local testing also for reporting

node scripts/nodejs/merge.js

## Compare Images using Perceptual hashing
## For Pixel difference comment below line
#ddev exec php ./scripts/php/image-compare.php

## Generate Visual Diff Report
npx cypress-image-diff-html-report generate --configFile cypress-image-diff.config.cjs --reportJsonFilePath ./public/visual-diff/merge/index.json --outputDir ./public/visual-diff

## Start Server and Open Visual Diff Report
node scripts/nodejs/start-server.js
