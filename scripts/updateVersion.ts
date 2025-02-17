import path from 'path';
import { readJsonSync, writeFileSync } from 'fs-extra';

const esmVersionFilePath = path.join(__dirname, '../dist/version/index.js');
const packageJsonPath = path.join(__dirname, '../package.json');
const packageVersion = readJsonSync(packageJsonPath).version;

const esmCode = `export const version = 'v${packageVersion}'\n`;

writeFileSync(esmVersionFilePath, esmCode);
