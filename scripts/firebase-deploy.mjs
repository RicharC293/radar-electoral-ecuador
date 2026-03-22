import { spawn } from "node:child_process";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? 1}`));
    });

    child.on("error", reject);
  });
}

async function main() {
  console.log("Building Firebase Functions...");
  await run("npm", ["--prefix", "functions", "run", "build"]);

  console.log("Deploying Firestore, Storage and Functions...");
  await run("npx", [
    "firebase",
    "deploy",
    "--only",
    "firestore:rules,firestore:indexes,storage,functions"
  ]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
