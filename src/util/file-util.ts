const fs = require('fs');
const { exec, execFile } = require('child_process');

async function modifyFile(
  cmd: string,
  oldPath: string,
  newPath: string,
): Promise<void> {
  if (!fs.existsSync(oldPath)) {
    console.log(`${oldPath} does not exists!`);
    return;
  }

  exec(
    `${cmd} ${oldPath} ${newPath}`,
    (_error: any, _stdout: any, _stderr: any) => {},
  );
}

async function writeOutputToFile(stdout: string, outputPath: string) {
  fs.open(outputPath, 'w', (error: any, fd: any) => {
    if (error != null) {
      console.error(`error: ${error}`);
      return;
    }

    fs.write(fd, stdout, (error: Error) => {
      if (error != null) {
        console.error(`error: ${error}`);
      }
    });
  });
}

async function executeFile(
  filePath: string,
  outputFilePath: string,
): Promise<void> {
  if (!fs.existsSync(filePath)) {
    console.log('file does not exists!');
    return;
  }

  execFile(filePath, (error: any, stdout: any, stderr: any) => {
    if (error != null) {
      console.error(`error: ${error}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    writeOutputToFile(stdout, outputFilePath);
  });
}

async function createFolder(path: string): Promise<void> {
  exec(`mkdir ${path}`, (_error: any, _stdout: any, _stderr: any) => {});
}

module.exports = { modifyFile, executeFile, writeOutputToFile, createFolder };
