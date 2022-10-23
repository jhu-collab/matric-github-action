import * as fs from 'fs';
import path from 'path';
import { exec, execFile } from 'child_process';

export async function modifyFile(
  cmd: string,
  oldPath: string,
  newPath: string,
): Promise<boolean> {
  if (!fileExists(oldPath)) {
    console.log(`${oldPath} does not exists!`);
    return false;
  }

  return new Promise((resolve, reject) => {
    exec(
      `${cmd} ${oldPath} ${newPath}`,
      (error: any, _stdout: any, _stderr: any) => {
        if (error != null) {
          console.warn(error);
          reject(`Failed to ${cmd} files!`);
        }
        resolve(true);
      },
    );
  });
}

export async function writeOutputToFile(
  stdout: string,
  outputPath: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.open(outputPath, 'w', (error: any, fd: any) => {
      if (error != null) {
        reject(`error: ${error}`);
      }

      fs.write(fd, stdout, (error: unknown) => {
        if (error) {
          reject(`error: ${error}`);
        }
        resolve(true);
      });
    });
  });
}

export async function executeFile(
  filePath: string,
  outputFilePath: string,
): Promise<boolean> {
  if (!fileExists(filePath)) {
    console.log('file does not exists!');
    return false;
  }
  return new Promise((resolve, reject) => {
    execFile(filePath, async (error: any, stdout: any, _stderr: any) => {
      if (error != null) {
        reject(`error: ${error}`);
        return;
      }
      const wroteSuccessfully = await writeOutputToFile(stdout, outputFilePath);
      resolve(wroteSuccessfully);
    });
  });
}

export async function createFolder(path: string): Promise<void> {
  exec(`mkdir ${path}`, (_error: any, _stdout: any, _stderr: any) => {});
}

export function fileExists(path: string): boolean {
  return fs.existsSync(path);
}

export function build_path(): string {
  return path.join(__dirname, '..', '..');
}
