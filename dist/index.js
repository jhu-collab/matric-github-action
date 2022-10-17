"use strict";
const core = require('@actions/core');
const github = require('@actions/github');
async function run() {
    // Generate the OIDC token
    const oidcToken = await core.getIDToken();
    core.setOutput('token', oidcToken);
}
run();
