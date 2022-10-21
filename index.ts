import core from '@actions/core';
import github from '@actions/github';
import path from 'path';
import { execSync } from 'child_process';

async function cloneRepo(url: string): Promise<void> {
  execSync(`git clone {url}`, { stdio: [], cwd: path.resolve(__dirname, '') });
}

async function run(): Promise<void> {
  // Generate the OIDC token
  const oidcToken = await core.getIDToken();
  core.setOutput('token', oidcToken);
  core.info(__dirname);
  core.info(oidcToken);
  core.info(build_path());
}

function build_path(): string {
  return path.basename(__dirname);
}
run();
