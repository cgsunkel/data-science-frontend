/* eslint-disable */
const WdioImage = require ('@uktrade/wdio-image-diff-js').default
const browserstack = require('browserstack-local')
const IMPLICIT_TIMEOUT = process.env.WDIO_IMPLICIT_TIMEOUT || 90000
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080'
const browserStackUser = process.env.BROWSERSTACK_USERNAME || ''
const browserStackKey = process.env.BROWSERSTACK_ACCESS_KEY || ''
let testName
exports.config = {
  specs: [
    './uiTest/visual/src/specs/**/*.js',
  ],
  // Code to start browserstack local before start of test
  onPrepare: function () {
    console.log("Connecting local");
    return new Promise(function(resolve, reject){
      exports.bs_local = new browserstack.Local()
      exports.bs_local.start({'key': exports.config.key }, function(error) {
        if (error) return reject(error)
        console.log('Connected. Now testing...')
        resolve()
      })
    })
  },
  // Code to stop browserstack local after end of test
  onComplete: function () {
    exports.bs_local.stop(function() {})
  },
  capabilities: [
    {
      'os': 'Windows',
      'os_version': '10',
      'browserName': 'Chrome',
      'browser_version': '83.0 beta',
      'resolution': '1280x1024'
    },
  ],
  featureFlags: {
    specFiltering: true
  },
  maxInstances: 10,
  logLevel: 'error',
  bail: 0,
  baseUrl: BASE_URL,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: [
    [
      'browserstack', {
        browserstackLocal: true
      }
    ]
  ],
  user: browserStackUser,
  key: browserStackKey,
  browserstackLocal: true,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    timeout: 60000,
  },
  before: () => {
    browser.setTimeout({ 'implicit': IMPLICIT_TIMEOUT })
    const wdioImageDiff = new WdioImage(browser, { threshold: 0.2, width: 1792, height: 1008 })
    browser.imageDiff = wdioImageDiff
  },
  beforeTest: (test) => {
    testName = `${test.parent} ${test.title} - ${browser.capabilities.browserName}`
    browser.imageDiff.testName = testName
  },
  after: () => {
    browser.imageDiff.generateReport()
  }
}
