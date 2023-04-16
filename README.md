# Matric Github Action

Runs the autograder for a student.

## Building dist/

In order for the code that's run to be updated, you have to re-build the dist/ folder
after changes were made.

```bash
npm i
npx ncc build src/index.ts --license licenses.txt
```

## Running the actions to submit

There is an example github actions file in the `jhu-collab/hw1` repository which should
be the most up-to-date .yml file to include in repositories. Just in case, the actions
file is embedded here:

```yml
name: Submission

on:
  push:
    branches:
      - submission

jobs:
  submit:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Run matric action
        uses: jhu-collab/matric-github-action@dev   # May want to change this to @main
```

Whenever students make a push to the `submission` branch of their repository, this
action will run the code last built in `dist/index.ts`, which is what should run the
autograder and post the results to wherever it is required.