# Matric Github Action

Runs the autograder for a student.

## Building dist/

In order for the code that's run to be updated, you have to re-build the dist/ folder
after changes were made.

`npm i`
`npx ncc build src/index.ts --license licenses.txt`