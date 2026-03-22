import { watch } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const watchedPaths = [
  "firestore.rules",
  "firestore.indexes.json",
  "storage.rules",
  "firebase.json",
  "functions/src",
  "functions/package.json",
  "functions/tsconfig.json"
].map((item) => resolve(process.cwd(), item));

let timer = null;
let running = false;
let rerunRequested = false;

function runDeploy() {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("npm", ["run", "firebase:deploy"], {
      stdio: "inherit",
      shell: false
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Deploy failed with exit code ${code ?? 1}`));
    });

    child.on("error", rejectPromise);
  });
}

async function deploySerial() {
  if (running) {
    rerunRequested = true;
    return;
  }

  running = true;

  try {
    console.log("\n[firebase-watch] Change detected. Running deploy...\n");
    await runDeploy();
    console.log("\n[firebase-watch] Deploy completed.\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown deploy error";
    console.error(`\n[firebase-watch] ${message}\n`);
  } finally {
    running = false;

    if (rerunRequested) {
      rerunRequested = false;
      await deploySerial();
    }
  }
}

function scheduleDeploy(changedPath) {
  if (timer) {
    clearTimeout(timer);
  }

  console.log(`[firebase-watch] Change queued: ${changedPath}`);
  timer = setTimeout(() => {
    timer = null;
    void deploySerial();
  }, 700);
}

for (const target of watchedPaths) {
  watch(
    target,
    {
      recursive: true
    },
    (_eventType, filename) => {
      scheduleDeploy(filename ? `${target}:${filename}` : target);
    }
  );
}

console.log("[firebase-watch] Watching Firebase files for changes...");
console.log("[firebase-watch] Press Ctrl+C to stop.");
