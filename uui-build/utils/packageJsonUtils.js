const fs = require("fs");
const path = require("path");

module.exports = { readPackageJsonContentAsync, readPackageJsonContentSync, copyPackageJsonAsync };

function readPackageJsonContentSync(dir) {
    const s = fs.readFileSync(path.resolve(dir, 'package.json')).toString('utf-8');
    return JSON.parse(s)
}

async function readPackageJsonContentAsync(dir) {
    const s = await fs.readFile(path.resolve(dir, 'package.json')).toString('utf-8');
    return JSON.parse(s)
}

async function copyPackageJsonAsync({ fromDir, toDir, transform }) {
    const content = await readPackageJsonContentAsync(fromDir);
    transform(content);
    const contentStr = JSON.stringify(content, undefined, 2);
    const to = path.resolve(toDir, `./package.json`);
    await fs.writeFileSync(to, contentStr)
}
