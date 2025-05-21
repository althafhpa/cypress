<?php

/* Visual Diff Image compare using Perceptual Hashing method & Update Reports merged json files.
 * Run php image compare using Perceptual Hashing Method and update visual diff & mochawesome json report files.
 * Run against previously failed visual diff html pixel comparison result.
 */

require 'vendor/autoload.php';

use SapientPro\ImageComparator\ImageComparator;

echo "Starting image compare using Perceptual Hashing Method.\n";

$similarity_threshold = 85;
$failureThreshold = (100 - $similarity_threshold)/100;

$diff_file =  './public/visual-diff/merge/index.json';

if (!file_exists($diff_file)) {
    die("Error: Required JSON files are missing.\n");
}

$json_data = json_decode(file_get_contents($diff_file), true);

if (!$json_data || !isset($json_data['suites'])) {
    die("Error: JSON files are malformed or missing expected data structures.\n");
}

$imageComparator = new ImageComparator();
$diff_links = [];

if(count($json_data['suites'][0]['tests']) > 0) {
    foreach ($json_data['suites'][0]['tests'] as $key => &$test) {

        try {

            // Add existence checks for both images
            if (!file_exists($test['baselinePath'])) {
                echo "Baseline image not found: {$test['baselinePath']}\n";
                continue;
            }

            if (!file_exists($test['comparisonPath'])) {
                echo "Comparison image not found: {$test['comparisonPath']}\n";
                continue;
            }

            $similarity = $imageComparator
                ->compare($test['baselinePath'], $test['comparisonPath']);

            echo "Image: {$test['diffPath']} - Similarity: $similarity\n";

            if ($similarity >= $similarity_threshold) {
                $test['status'] = 'pass';
                if(file_exists($test['diffPath'])) {
                    unlink($test['diffPath']);
                }
                $test['diffPath'] = '';
                $test['percentage'] = $similarity / 100;
                $test['failureThreshold'] = $failureThreshold;
                $json_data['totalPassed']++;
                $json_data['totalFailed']--;
                // Will be used to update mochawesome json report.
                //$diff_links[] = trim($test['name']);
            } else {
                $test['percentage'] = $similarity / 100;
                $test['failureThreshold'] = $failureThreshold;
            }
        } catch (Exception $e) {
            echo "Error processing {$test['diffPath']}: {$e->getMessage()}\n";
        }
    }

    file_put_contents($diff_file, json_encode($json_data, JSON_PRETTY_PRINT));
}