<?php
// Not part of Test.
// Check which urls are run and missed in visual diff tests by comparing with
// original urs.json file and update to csv files matched-test.csv and missed-test.csv.
// Usage is optional.

// Function to read and decode JSON from a file
function readJsonFile($filePath) {
    $content = file_get_contents($filePath);
    return json_decode($content, true);
}

// Function to extract path from URL and ignore paths with file extensions
function extractPath($url) {
    $parsedUrl = parse_url($url);
    $path = isset($parsedUrl['path']) ? ltrim($parsedUrl['path'], '/') : '';

    // Ignore paths with file extensions
    if (preg_match('/\.(pdf|xlsx?|docx?|txt|csv|zip|rar|jpg|jpeg|png|gif|svg)$/i', $path)) {
        return null;
    }

    return $path;
}

// File paths
$urlsJsonPath = './cypress/fixtures/urls.json';
$visualDiffJsonPath = './public/visual-diff/merge/index.json';
$outputFilePathMissed = './cypress/fixtures/missed-test.csv';
$outputFilePathMatched = './cypress/fixtures/matched-test.csv';

// Read JSON data from both files
$urlsData = readJsonFile($urlsJsonPath);
$visualDiffData = readJsonFile($visualDiffJsonPath);

// Extract paths from the urls.json file
$paths = array_filter(array_map(function($item) {
    return extractPath($item['comparison']);
}, $urlsData));

// Remove duplicates
$paths = array_unique($paths);

// Get comparison data from the visual-diff index.json file
$comparisonPaths = [];
foreach ($visualDiffData['suites'] as $suite) {
    foreach ($suite['tests'] as $test) {
        $path = extractPath($test['name']);
        if ($path !== null) {
            $comparisonPaths[] = $path;
        }
    }
}
$comparisonPaths = array_unique($comparisonPaths);

// Compare paths
$matchingPaths = array_intersect($paths, $comparisonPaths);
$nonMatchingPaths = array_diff($paths, $comparisonPaths);

// Save non-matching paths to CSV file
$csvFile = fopen($outputFilePathMatched, 'w');
//fputcsv($csvFile, ['Path', 'Status']);
foreach ($paths as $path) {
    $status = in_array($path, $comparisonPaths) ? 'Matched' : 'Missing';
    if ($status === 'Matched') {
        fputcsv($csvFile, [$path, $status]);
    }
    fputcsv($csvFile, [$path]);
}
fclose($csvFile);

// Save non-matching paths to CSV file
$csvFile = fopen($outputFilePathMissed, 'w');
//fputcsv($csvFile, ['Path', 'Status']);
foreach ($paths as $path) {
    $status = in_array($path, $comparisonPaths) ? 'Matched' : 'Missing';
    if ($status === 'Missing') {
        fputcsv($csvFile, [$path]);
    }
}
fclose($csvFile);

// Output results
echo "Matching Paths: " . count($matchingPaths) . "\n";
echo "Non-Matching Paths: " . count($nonMatchingPaths) . "\n";

echo "\nPaths in visual-diff but not in urls.json: " . count(array_diff($comparisonPaths, $paths)) . "\n";

// Calculate and display percentages
$totalUrls = count($paths);
$matchingCount = count($matchingPaths);
$nonMatchingCount = count($nonMatchingPaths);

$matchingPercentage = ($matchingCount / $totalUrls) * 100;
$nonMatchingPercentage = ($nonMatchingCount / $totalUrls) * 100;

echo "\nPercentages:\n";
echo "Matching: " . number_format($matchingPercentage, 2) . "%\n";
echo "Non-Matching: " . number_format($nonMatchingPercentage, 2) . "%\n";

// Output total counts
echo "\nTotal Counts:\n";
echo "Total unique paths in urls.json: $totalUrls\n";
echo "Total unique paths in visual-diff: " . count($comparisonPaths) . "\n";
echo "Matching paths: $matchingCount\n";
echo "Non-matching paths: $nonMatchingCount\n";

echo "\nResults have been saved to: $outputFilePathMissed and $outputFilePathMissed\n";
