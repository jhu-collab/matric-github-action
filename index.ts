const core = require('@actions/core');
const github = require('@actions/github');

async function run(): Promise<void> {
  // Generate the OIDC token
  const oidcToken = await core.getIDToken();
  core.setOutput('token', oidcToken);
  core.setSecret('token', oidcToken);
  core.info(__dirname);
}
run();
