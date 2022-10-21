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

async function cloneRepo(url: string): Promise<void> {
  exec(
    `git clone ${url}`,
    {
      cwd: build_path(),
    },
    (_error: any, _stdout: any, _stderr: any) => {},
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
  cloneRepo(repoUrl);
  moveFile(path.join(topUrl, 'csf-hw3'), path.join(topUrl, 'source'));
  //moveFile(path.join(topUrl, 'csf-hw3'), path.join(topUrl, 'submission'));

  console.info(repoName);
  fs.readdirSync(build_path()).forEach((file: any) => {
    console.info(file);
  });

  exec(
    `rm -rf source`,
    {
      cwd: build_path(),
    },
    (_error: any, _stdout: any, _stderr: any) => {},
  );
}

function build_path(): string {
  return path.join(__dirname, '..', '..');
}
run();
