require('dotenv').config();
const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');

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
      if (!error) {
        moveFile(
          path.join(directory, repoName),
          path.join(directory, 'source'),
        );
      }
    },
  );
}

async function moveFile(oldPath: string, newPath: string): Promise<void> {
  console.log('oldPath:', oldPath, ' newPath:', newPath);
  if (!fs.existsSync(oldPath)) {
    console.log('file does not exists!');
    return;
  }

  exec(
    `mv ${oldPath} ${newPath}`,
    (_error: any, _stdout: any, _stderr: any) => {
      console.log(_error);
      fs.readdirSync(build_path()).forEach((file: any) => {
        console.info(file);
      });
    },
  );
}

async function run(): Promise<void> {
  const topUrl = build_path();
  const payload = github.context.payload;
  const repoName = payload.repository.name;
  //const oidcToken = await core.getIDToken();
  //const { courseId, assignmentId } = await genMatricTokenInfo(oidcToken);
  const repoUrl = 'https://github.com/ARaps1/csf-hw3.git';
  //const repoUrl = await genRepoUrl(courseId, assignmentId);
  cloneRepo(repoName, repoUrl);

  //moveFile(path.join(topUrl, 'csf-hw3'), path.join(topUrl, 'submission'));
}

function build_path(): string {
  return path.join(__dirname, '..', '..');
}
run();
