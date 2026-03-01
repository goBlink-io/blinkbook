#!/usr/bin/env node
import * as readline from "node:readline";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEMES = ["midnight", "ocean", "forest", "sunset", "lavender", "arctic"];
function prompt(rl, question, defaultValue) {
    const suffix = defaultValue ? ` (${defaultValue})` : "";
    return new Promise((resolve) => {
        rl.question(`${question}${suffix}: `, (answer) => {
            resolve(answer.trim() || defaultValue || "");
        });
    });
}
function selectTheme(rl) {
    return new Promise((resolve) => {
        console.log("\nSelect a theme:");
        THEMES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
        rl.question(`\nTheme [1-${THEMES.length}] (1): `, (answer) => {
            const idx = parseInt(answer.trim(), 10) - 1;
            resolve(THEMES[idx] || THEMES[0]);
        });
    });
}
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        }
        else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
async function main() {
    console.log("\n  ⚡ create-blinkbook\n");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // Accept project name from CLI arg or prompt
    const argName = process.argv[2];
    const projectName = argName || await prompt(rl, "Project name", "my-docs");
    const siteTitle = await prompt(rl, "Site title", `${projectName} Documentation`);
    const theme = await selectTheme(rl);
    rl.close();
    const targetDir = path.resolve(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
        console.error(`\n  Error: Directory "${projectName}" already exists.\n`);
        process.exit(1);
    }
    console.log(`\n  Creating ${projectName}...`);
    // Copy template
    const templateDir = path.join(__dirname, "..", "template");
    copyDir(templateDir, targetDir);
    // Update blinkbook.config.ts with user choices
    const configPath = path.join(targetDir, "blinkbook.config.ts");
    let configContent = fs.readFileSync(configPath, "utf-8");
    configContent = configContent.replace(/name: ".*?"/, `name: "${siteTitle.replace(/"/g, '\\"')}"`);
    configContent = configContent.replace(/title: ".*?"/, `title: "${siteTitle.replace(/"/g, '\\"')}"`);
    configContent = configContent.replace(/theme: "midnight"/, `theme: "${theme}"`);
    fs.writeFileSync(configPath, configContent);
    // Update package.json name
    const pkgPath = path.join(targetDir, "package.json");
    let pkgContent = fs.readFileSync(pkgPath, "utf-8");
    pkgContent = pkgContent.replace(/"name": ".*?"/, `"name": "${projectName.replace(/"/g, '\\"')}"`);
    fs.writeFileSync(pkgPath, pkgContent);
    // Install dependencies
    console.log("  Installing dependencies...\n");
    try {
        execSync("pnpm install", { cwd: targetDir, stdio: "inherit" });
    }
    catch {
        console.log("\n  pnpm not found, trying npm...");
        try {
            execSync("npm install", { cwd: targetDir, stdio: "inherit" });
        }
        catch {
            console.log("  Could not install dependencies. Run 'pnpm install' or 'npm install' manually.");
        }
    }
    console.log(`
  ✅ Done! Created ${projectName}

  Next steps:

    cd ${projectName}
    pnpm dev        # Start dev server

  Edit blinkbook.config.ts to customize your site.
  Add pages in src/content/ as .mdx files.

  Deploy:
    vercel deploy
`);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
