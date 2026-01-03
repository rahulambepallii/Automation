module.exports = {
  default: {
    paths:[
        "Features/**/*.feature"
    ],
    require: [
      'Steps/*.js'
    ],
    format: [
      'progress'
    ],
    report: {
    format: ['json:reports/cucumber-report.json']
    },
    // parallel: 3,
    publishQuiet: true
  }
};