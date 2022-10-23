import { AutograderData } from './autograder.interface';

const { readFileSync } = require('fs');
const { Ajv, JTDDataType } = require('ajv');
const { AutograderData } = require('./autograder.interface');

function readJSONFile(path: string) {}

function validateJSON(filePath: string) {
  type autograderResults = typeof JTDDataType<AutograderData>;
}
