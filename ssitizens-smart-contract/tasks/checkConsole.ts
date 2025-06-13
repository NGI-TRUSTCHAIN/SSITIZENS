import { task } from "hardhat/config";
import fs from "fs";
import path from "path";

task(
  "check:console",
  "Fails if any contract includes hardhat/console.sol"
).setAction(async (_, hre) => {
  const contractsDir = hre.config.paths.sources;

  function findBadIncludes(dir: string): string[] {
    let matches: string[] = [];

    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        matches = matches.concat(findBadIncludes(fullPath));
      } else if (file.endsWith(".sol")) {
        console.log(`Checking ${fullPath}`);
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes("hardhat/console.sol")) {
          matches.push(fullPath);
        }
      }
    }

    return matches;
  }

  const badFiles = findBadIncludes(contractsDir);

  if (badFiles.length > 0) {
    console.error(
      "❌ Hardhat console reference was found in the following files:"
    );
    for (const file of badFiles) {
      console.error(` - ${file}`);
    }
    // ✅ CI-friendly: termina con código 1
    process.exit(1);
  } else {
    console.log(
      "✅ Hardhat console reference was not found in any files."
    );
  }
});
