const {
  env,
  argv
} = process;

function isTrue(value, envName = undefined) {
  // eslint-disable-next-line eqeqeq
  return value === 'true'
    // eslint-disable-next-line
    || value == 1
    || value === true
    // если есть имя, но неопределено
    || (envName && value === undefined && Object.prototype.hasOwnProperty.call(env, envName));
}

function getEnv(envName) {
  return env[envName];
}

function getBoolEnv(envName) {
  return isTrue(getEnv(envName), envName);
}

function getCmdArg(searchFor) {
  const cmdLineArgs = argv.slice(2, argv.length);
  const argName = `--${searchFor}=`;

  for (let argvIt = 0; argvIt < cmdLineArgs.length; argvIt++) {
    if (cmdLineArgs[argvIt].indexOf(argName) === 0) {
      return cmdLineArgs[argvIt].substr(argName.length);
    }
  }

  return false;
}

module.exports = {
  isTrue,
  getEnv,
  getBoolEnv,
  getCmdArg
};
