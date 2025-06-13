import 'dotenv/config';
import nconf from 'nconf';
import * as yaml from 'js-yaml';
import fs from 'node:fs';

const yamlFormat = {parse: yaml.load, stringify: yaml.dump};

// 1st priority - Env vars
console.info('Loading Env vars');
// console log all env vars for debugger purposes
// Object.keys(process.env).forEach((key) => {  console.info(`${key}: ${process.env[key]}`) });
nconf.env({
  separator: '_',
  lowerCase: true,
  parseValues: true,
});

// 2nd priority - Settings file
const settingsFilePath = process.env.SETTINGS_FILE || '';
if (settingsFilePath) {
  if (fs.existsSync(settingsFilePath)) {
    console.info(`Loading settings from ${settingsFilePath}`);
    nconf.file({file: `${settingsFilePath}`, format: yamlFormat});
  } else {
    throw new Error(
      `Settings file declared but not found: ${settingsFilePath}`,
    );
  }
}

// 3rd priority - Default profile
const defaultsFileName =
  process.env.NODE_ENV === 'production' ? 'production' : 'default';
// TODO: hacer cálculo dinámico de la ruta, en base al fichero actual
const defaultsFilePath = `./src/shared/settings/profiles/${defaultsFileName}.yaml`;
if (fs.existsSync(defaultsFilePath)) {
  console.info(`Loading '${defaultsFileName}' profile`);
  nconf.file('defaults', {file: `${defaultsFilePath}`, format: yamlFormat});
}

console.info('Swagger available at:');
console.info(`http://localhost:8080/docs/`);
