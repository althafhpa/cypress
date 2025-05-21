const config = {
    FAILURE_THRESHOLD: 0.05,
    COMPARISON_OPTIONS: { threshold: 0.05 },
    ROOT_DIR: 'public/visual-diff',
    REPORT_DIR: 'json',
    SCREENSHOTS_DIR: 'screenshots',
    JSON_REPORT: {
        FILENAME: 'report',
        OVERWRITE: false,
    },
    disableTimersAndAnimations: true
}

module.exports = config
