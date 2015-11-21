#! /usr/bin/env node

var fs = require('fs'),
  p = require('path'),
  execSync = require('child_process').execSync;

var __VERSION = '0.0.4',
  VERSION = 'version: ',
  cmd = 'eslint --rulesdir aline-custom-rules -f \'./compact-json-formatter.js\' ',
  NO_DIR_MSG             = 'Directory does not exist: ',
  FILES_ERRORS_COUNT_MSG = 'Total files with errors found: ',
  FILES_SCANNED          = 'Total files scanned: ',
  FILES_ANALIZED         = 'Total files analized: ',
  POINTS_DEDUCTION       = 'Total points deduction : ',
  TOTAL_ISSUES           = 'Total number of issue found: ',
  ANGULAR_ISSUES         = 'Total number of AngularJS issues found: ',
  ANALYSIS_START         = 'Analysis started ...',
  ANALYSIS_END           = 'Analysis completed.',
  DEFAULT_ENCODING       = 'utf-8';

var penalties = {
  'A-001': 5
};

console.log('***************************************************');
console.log('** Tool for checking code quality (using eslint) **');
console.log('***************************************************');

var args = process.argv.slice(2),
  debug = false,
  execOut;

function debugLog(str) {
  debug && console.log(str);
}

function getPenalPoints (msg) {
  var code = msg.match(/A-[0-9]{3}/);
  return code && penalties[code] || 0;
}
  
var filteredArgs = args.filter(function(arg) {
  if(arg === '--debug') {
    debug = true;
  }
  return arg !== '--debug';
});

filteredArgs = filteredArgs.map(function(path) {
  return path.replace(/ /g, '\\ ');
});

if(filteredArgs.length > 0) {
  console.log(ANALYSIS_START);
  try {
    execOut = execSync(cmd + filteredArgs.join(' '));
  } catch(err) {
    execOut = err.stdout.toString(DEFAULT_ENCODING);
  }
} else {
  console.log('Error: you should specify some folders to grade.');
  process.exit(1);
}

var jsonObj = JSON.parse(execOut);

var allFiles = jsonObj.map(function(el) {
  return el.filePath;
});
debugLog(allFiles);

var totalIssues = jsonObj.reduce(function(acc, el) {
  // return acc + (el.errorCount || 0) + (el.warningCount || 0);
  return acc + (el.issuesCount || 0);
}, 0);

var customRulesPenal = jsonObj.reduce(function(acc, el) {
  return acc + el.messages.reduce(function(fileAcc, msg) {
    return fileAcc + getPenalPoints(msg.message);
  }, 0);
}, 0);


console.log(ANALYSIS_END + '\n');
console.log('===================================================');
console.log(FILES_ANALIZED   + allFiles.length);
console.log(TOTAL_ISSUES     + totalIssues);
console.log(POINTS_DEDUCTION + (5*totalIssues + customRulesPenal));
console.log('===================================================');
console.log(VERSION + __VERSION);
