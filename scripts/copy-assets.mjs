import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

function copyFiles(srcDir, destDir, ext) {
  if (!existsSync(srcDir)) return;
  const entries = readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyFiles(srcPath, destPath, ext);
    } else if (entry.isFile() && ext.some((e) => entry.name.endsWith(e))) {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} -> ${destPath}`);
    }
  }
}

copyFiles('nodes', 'dist/nodes', ['.svg', '.png']);
copyFiles('credentials', 'dist/credentials', ['.svg', '.png']);
console.log('Asset copy complete.');
