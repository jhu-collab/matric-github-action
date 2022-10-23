const { readFileSync } = require('fs');
const { Ajv } = require('ajv');
const { build_path } = require('./file-util');
const path = require('path');

function readJSONFile(path: string) {
  return JSON.parse(readFileSync(path));
}

function validateJSON(filePath: string) {
  //const ajv = new Ajv();
  const schema = readJSONFile(path.join(__dirname, 'autograderData.json'));
  const results = readJSONFile(filePath);
  //const validate = ajv.compile(schema);
  /*
  if (!validate(results)) {
    return false;
  }
  */

  return true;
}

export = { readJSONFile, validateJSON };
