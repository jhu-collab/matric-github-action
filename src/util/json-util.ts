import { readFileSync } from 'fs';
import path = require('path');

export function readJSONFile(path: string) {
  return JSON.parse(JSON.stringify(readFileSync(path)));
}

export function validateJSON(filePath: string) {
  //const ajv = new Ajv();
  const results = readJSONFile(filePath);
  //const validate = ajv.compile(schema);
  /*
  if (!validate(results)) {
    return false;
  }
  */

  return true;
}
