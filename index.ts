import {
  PayloadRepository,
  WebhookPayload,
} from '@actions/github/lib/interfaces';

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

async function cloneRepo(repoName: string, url: string): Promise<void> {
  const directory = build_path();
  exec(
    `git clone ${url}`,
    {
      cwd: directory,
    },
    (error: any, _stdout: any, _stderr: any) => {
      modifyFile(
        'mv',
        path.join(directory, repoName),
        path.join(directory, 'source'),
      );
    },
  );
}

async function sendResults(
  path: string,
  githubPayload: WebhookPayload,
): Promise<void> {
  try {
    const resultsJSON = readJSONFile(path);
    //const commitId =
    //const actor = githubPayload.
    const repoName = githubPayload?.repository?.name;
    const payload = {};
    const res = await axios.get(`${process.env.SERVER_HOST}/autograders/`);
    return res.data;
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
  core.info(payload);
  core.info('\n');
  core.info(github.context);
  console.log(payload);
  console.log(github.context);
  const repoName = 'hsf'; //payload.repository.name;
  //const oidcToken = await core.getIDToken();
  //const { courseId, assignmentId } = await genMatricTokenInfo(oidcToken);
  const repoUrl = 'https://github.com/ARaps1/csf-hw3.git';
  //const repoUrl = await genRepoUrl(courseId, assignmentId);
  //cloneRepo('csf-hw3', repoUrl);
  //modifyFile('cp', path.join(dir, repoName), path.join(dir, 'submission'));
  //createFolder(path.join(dir, 'results'));

  //copy the setup.sh file

  /*modifyFile(
    'cp',
    path.join(dir, 'source', 'setup.sh'),
    path.join(dir, 'setup.sh'),
  );
  */

  // Execute the setup.sh file if it exists and redirect output
  //executeFile(path.join(dir, 'script.sh'), path.join(dir, 'setup.logs.txt'));

  // copy the run_autograder file
  /* modifyFile(
    'cp',
    path.join(dir, 'source', 'setup.sh'),
    path.join(dir, 'setup.sh'),
  );
  
  //Execute the run_autograder file
  executeFile(
    path.join(dir, 'run_autograder'),
    path.join(dir, 'run_autograder.logs.txt'),
  );
  */

  // Verify that there is a file in results/results.json
  //console.log(validateResults(path.join(dir, 'results/results.json')));
}

run();

export {};
