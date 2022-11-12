import { readFileSync } from 'fs';
import { build_path } from './file-util';
import path from 'path';

const autoGraderProperties = new Set([
  'score',
  'execution_time',
  'output',
  'visibility',
  'stdout_visibility',
  'extra_data',
  'tests',
  'leaderboard',
]);

const testProperties = new Set([
  'score',
  'execution_time',
  'output',
  'visibility',
  'stdout_visibility',
  'extra_data',
  'tests',
  'leaderboard',
]);

export function readJSONFile(path: string) {
  return JSON.parse(JSON.stringify(readFileSync(path)));
}

function isAny(value: string, types: Array<string>): boolean {
  return types.includes(value);
}

function propertyExists(prop: string, obj: object): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isVisibility(value: string) {
  return isAny(value, [
    'hidden',
    'after_due_date',
    'after_published',
    'visible',
  ]);
}

function validateLeaderBoard(data: unknown) {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const obj of data) {
    if (typeof obj != 'object') {
      return false;
    }

    if (!propertyExists('name', obj) || !propertyExists('value', obj)) {
      return false;
    }

    if (!propertyExists('order', obj) || !isAny(obj['order'], ['asc', 'dsc'])) {
      return false;
    }
  }
}

function validateTests(data: unknown, scorePresentTopLevel: boolean) {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const test of data) {
    for (const prop in test) {
      if (!testProperties.has(prop)) {
        return false;
      }
    }

    if (
      !scorePresentTopLevel &&
      (!propertyExists('score', test) || isNaN(test['score']))
    ) {
      return false;
    }

    if (propertyExists('max_score', test) && isNaN(test['max_score'])) {
      return false;
    }

    if (
      propertyExists('status', test) &&
      !isAny(test['status'], ['passed', 'failed'])
    ) {
      return false;
    }

    if (propertyExists('tags', test) && !Array.isArray(test['tags'])) {
      return false;
    }

    if (propertyExists('score', test) && isNaN(test['lineNumber'])) {
      return false;
    }

    if (
      propertyExists('visibility', test) &&
      isVisibility(test['visibility'])
    ) {
      return false;
    }
  }
}

// eslint-disable-next-line
function validateProperties(obj: any): boolean {
  if (obj == null || typeof obj != 'object') {
    return false;
  }

  for (const prop in obj) {
    if (!autoGraderProperties.has(prop)) {
      return false;
    }
  }
  const scorePresentTopLevel =
    propertyExists('score', obj) && !isNaN(obj['score']);

  if (propertyExists('visibility', obj) && !isVisibility(obj['visibility'])) {
    return false;
  }

  if (
    propertyExists('stdout_visibility', obj) &&
    !isVisibility(obj['stdout_visibility'])
  ) {
    return false;
  }

  if (propertyExists('execution_time', obj) && isNaN(obj['execution_time'])) {
    return false;
  }

  if (scorePresentTopLevel && !propertyExists('tests', obj)) {
    return false;
  }

  if (
    propertyExists('tests', obj) &&
    !validateTests(obj['tests'], scorePresentTopLevel)
  ) {
    return false;
  }

  if (
    propertyExists('leaderboard', obj) &&
    !validateLeaderBoard(obj['leaderboard'])
  ) {
    return false;
  }
  return true;
}

function validateJSON(filePath: string): boolean {
  try {
    const results = readJSONFile(filePath);
    return validateProperties(results);
  } catch (err: unknown) {
    console.error(err);
    return false;
  }
}

validateJSON(path.join(build_path(), 'results/results.json'));
export { validateJSON };
