const cron = require('node-cron');
const fs = require('fs');

const { exec } = require('child_process');
const {
  config: { scriptFilePath, runIntervalInMinutes },
} = require('./package.json');

configValidator();

shScriptExecutor(scriptFilePath);

cron.schedule(`*/${runIntervalInMinutes} * * * *`, () => {
  shScriptExecutor(scriptFilePath);
});

function shScriptExecutor(file) {
  log();
  exec(`sh ${file}`, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });
}

function log() {
  const minuteLabel = runIntervalInMinutes === 1 ? 'minute' : 'minutes';
  console.log(`Running script ${scriptFilePath} - ${new Date()}`);
  console.log(`Interval: every ${runIntervalInMinutes} ${minuteLabel}`);
}

function configValidator() {
  let hasError = false;
  let errorMessage = [];

  // validate runIntervalInMinutes
  const number = Number(runIntervalInMinutes);
  if (number < 1 || isNaN(number)) {
    hasError = true;
    errorMessage.push('runIntervalInMinutes configuration must be a number greater than or equal to 1');
  }

  // validate script file if exist
  if (!fs.existsSync(scriptFilePath)) {
    hasError = true;
    errorMessage.push(`${scriptFilePath} script file does not exist`);
  }

  if (hasError) {
    errorMessage.forEach((message) => console.log(`ERROR: ${message}`));
    process.exit();
  }
}
