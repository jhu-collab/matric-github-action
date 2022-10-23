import {
  PayloadRepository,
  WebhookPayload,
} from '@actions/github/lib/interfaces';
import { resolve } from 'path';

require('dotenv').config();
const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const { validateJSON, readJSONFile } = require('./src/util/json-util.ts');
const {
  modifyFile,
  createFolder,
  executeFile,
  fileExists,
  build_path,
} = require('./src/util/file-util.ts');

async function genMatricTokenInfo(token: string) {
  try {
    const res = await axios.post(`${process.env.SERVER_HOST}/actions/auth`, {
      token: token,
    });

    const resJWT = await axios.post(
      `${process.env.SERVER_HOST}/actions/auth/test`,
      {
        token: res.data.token,
      },
    );
    return resJWT.data;
  } catch (error) {
    console.error(error);
  }
}

async function genRepoUrl(assignmentId: string, courseId: string) {
  try {
    const res = await axios.get(
      `${process.env.SERVER_HOST}/autograders/${courseId}/${assignmentId}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

async function cloneRepo(repoName: string, url: string): Promise<boolean> {
  const directory = build_path();
  return new Promise((resolve, reject) => {
    exec(
      `git clone ${url}`,
      {
        cwd: directory,
      },
      async (error: any, _stdout: any, _stderr: any) => {
        const renamedSource = await modifyFile(
          'mv',
          path.join(directory, repoName),
          path.join(directory, 'source'),
        );

        if (!renamedSource) {
          reject('failed to clone and rename repo!');
        }

        const copiedSetup = await modifyFile(
          'cp',
          path.join(directory, 'source', 'setup.sh'),
          path.join(directory, 'setup.sh'),
        );

        if (!copiedSetup) {
          reject('failed to copy the setup.sh file');
        }

        const copiedRunAutograder = await modifyFile(
          'cp',
          path.join(directory, 'source', 'run_autograder'),
          path.join(directory, 'run_autograder'),
        );

        if (!copiedRunAutograder) {
          reject('failed to copy the run_autograder file');
        }
        resolve(true);
      },
    );
  });
}

async function executeSetupAndAutograder(): Promise<boolean> {
  const dir = build_path();
  return new Promise(async (resolve, reject) => {
    // Execute the setup.sh file if it exists and redirect output
    const setup = await executeFile(
      path.join(dir, 'setup.sh'),
      path.join(dir, 'setup.logs.txt'),
    );

    let autograder = false;

    if (setup) {
      autograder = await executeFile(
        path.join(dir, 'run_autograder'),
        path.join(dir, 'run_autograder.logs.txt'),
      );
    }

    if (!autograder) {
      reject('failed to run autograder!');
    }

    resolve(setup && autograder);
  });
}

async function sendResults(
  path: string,
  actor: string,
  commitId: string,
  repoName: string,
): Promise<void> {
  try {
    const resultsJSON = readJSONFile(path);
    const payload = { repoName, actor, commitId, results: resultsJSON };
    await axios.post(`${process.env.SERVER_HOST}/submission/`, payload);
  } catch (error) {
    console.error(error);
  }
}

function validateResults(path: string): boolean {
  if (!fileExists(path)) {
    return false;
  }
  return validateJSON(path);
}

async function run(): Promise<void> {
  const dir = build_path();
  const payload = github.context.payload;
  const repoName = payload.repository.name;
  const commitId = payload.head_commit.id;
  const actor = payload.head_commit.committer.username;

  const oidcToken = await core.getIDToken();
  const { courseId, assignmentId } = await genMatricTokenInfo(oidcToken);
  const repoUrl = await genRepoUrl(courseId, assignmentId);
  const repoClonedAndRenamed = await cloneRepo('csf-hw3', repoUrl);

  await modifyFile(
    'cp',
    path.join(dir, repoName),
    path.join(dir, 'submission'),
  );

  createFolder(path.join(dir, 'results'));

  if (!repoClonedAndRenamed) {
    core.error('Failed to clone the autograder repo!');
    return;
  }

  const setupAndAutograder = await executeSetupAndAutograder();

  // Verify that there is a file in results/results.json
  if (
    setupAndAutograder &&
    validateResults(path.join(dir, 'results/results.json'))
  ) {
    sendResults(
      path.join(dir, 'results/results.json'),
      actor,
      commitId,
      repoName,
    );
  }
}

run();

export {};
