#!/usr/bin/env node

/**
 * Automatic Version Updater
 * Updates version in package.json and version.json
 * Usage: node scripts/update-version.js [major|minor|patch] "Change description"
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read arguments
const versionType = process.argv[2] || 'patch'; // major, minor, or patch
const changeDescription = process.argv[3] || 'Updates and improvements';

// Read package.json
const packagePath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Read and update version.json
const versionPath = join(rootDir, 'version.json');
const versionJson = JSON.parse(readFileSync(versionPath, 'utf8'));

// Get current date
const today = new Date().toISOString().split('T')[0];

// Update version.json
versionJson.version = newVersion;
versionJson.buildDate = today;

// Add new changelog entry at the beginning
const newChangelog = {
  version: newVersion,
  date: today,
  changes: [changeDescription]
};

versionJson.changelog.unshift(newChangelog);

writeFileSync(versionPath, JSON.stringify(versionJson, null, 2) + '\n');

console.log(`✅ Version updated: ${packageJson.version} → ${newVersion}`);
console.log(`📝 Changelog: ${changeDescription}`);
console.log(`📅 Build date: ${today}`);
console.log('\nFiles updated:');
console.log('  - package.json');
console.log('  - version.json');
console.log('\n💡 Next steps:');
console.log(`  git add .`);
console.log(`  git commit -m "v${newVersion}: ${changeDescription}"`);
console.log(`  git push origin main`);
