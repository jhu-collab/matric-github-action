import dotenv from 'dotenv';
dotenv.config();
import core = require('@actions/core');
import github = require('@actions/github');
import path = require('path');
import { exec } from 'child_process';
import axios, { AxiosError } from 'axios';
import { validateJSON, readJSONFile } from './util/json-util';
import {
  modifyFile,
  createFolder,
  executeFile,
  fileExists,
  build_path,
} from './util/file-util';

const BASE_URL = 'https://matric.caprover.madooei.com/api/v1';

async function genMatricTokenInfo(token: string) {
  try {
    const matricToken = (
      await axios.post(`${BASE_URL}/actions/auth`, {
        token: token,
      })
    ).data;
    console.log(matricToken);
    const decodedContents = (
      await axios.post(`${BASE_URL}/actions/auth/decode`, {
        token: matricToken,
      })
    ).data;
    console.log(decodedContents);
    return decodedContents;
  } catch (error) {
    const err = error as AxiosError;
    console.error(err.response?.data);
  }
}

async function genRepoUrl(assignmentId: string, courseId: string) {
  try {
    const res = await axios.get(
      `${BASE_URL}/autograders/${courseId}/${assignmentId}`,
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
      async () => {
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
  return new Promise((resolve, reject) => {
    // Execute the setup.sh file if it exists and redirect output
    executeFile(path.join(dir, 'setup.sh'), path.join(dir, 'setup.logs.txt'))
      .then(() => {
        executeFile(
          path.join(dir, 'run_autograder'),
          path.join(dir, 'run_autograder.logs.txt'),
        );
      })
      .catch((err: unknown) => {
        reject(err);
      });

    resolve(true);
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
    await axios.post(`${BASE_URL}/submission/`, payload);
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
  const repoName = payload.repository?.name ?? '';
  const commitId = payload.head_commit.id;
  const actor = payload.head_commit.committer.username;
  console.log({ repoName, actor });
  const oidcToken = await core.getIDToken();
  const { courseId, assignmentId } = await genMatricTokenInfo(oidcToken);
  console.log({ courseId, assignmentId });
  // const repoUrl = await genRepoUrl(courseId, assignmentId);
  // const repoClonedAndRenamed = await cloneRepo('csf-hw3', repoUrl).then(
  //   async () => await executeSetupAndAutograder(),
  // );

  // await modifyFile(
  //   'cp',
  //   path.join(dir, repoName),
  //   path.join(dir, 'submission'),
  // );

  // createFolder(path.join(dir, 'results'));

  // if (
  //   repoClonedAndRenamed &&
  //   validateResults(path.join(dir, 'results/results.json'))
  // ) {
  //   sendResults(
  //     path.join(dir, 'results/results.json'),
  //     actor,
  //     commitId,
  //     repoName,
  //   );
  // }
}

run();

export {};
