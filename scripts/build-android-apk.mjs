import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const androidRoot = path.join(projectRoot, "android");
const isWindows = process.platform === "win32";

function javaMajorVersion(jdkPath) {
  try {
    const release = readFileSync(path.join(jdkPath, "release"), "utf8");
    const version = release.match(/^JAVA_VERSION="([^"]+)"/m)?.[1];
    return version ? Number.parseInt(version.split(".")[0], 10) : null;
  } catch {
    return null;
  }
}

function findCompatibleJdk() {
  const roots = [
    process.env.JAVA_HOME,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Programs", "Temurin21"),
    isWindows && "C:\\Program Files\\Eclipse Adoptium",
    isWindows && "C:\\Program Files\\Android\\Android Studio\\jbr",
  ].filter(Boolean);
  const candidates = [];

  for (const root of roots) {
    if (!existsSync(root)) continue;
    candidates.push(root);
    try {
      for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory()) candidates.push(path.join(root, entry.name));
      }
    } catch {
      // A candidate may be a file or an unreadable installation root.
    }
  }

  return candidates.find((candidate) => {
    const version = javaMajorVersion(candidate);
    return version >= 17 && version <= 24;
  });
}

const jdkPath = findCompatibleJdk();
const env = { ...process.env };
if (jdkPath) {
  env.JAVA_HOME = jdkPath;
  env.PATH = `${path.join(jdkPath, "bin")}${path.delimiter}${env.PATH ?? ""}`;
}

const gradle = isWindows
  ? spawn(env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "gradlew.bat assembleDebug"], {
      cwd: androidRoot,
      env,
      stdio: "inherit",
    })
  : spawn("./gradlew", ["assembleDebug"], {
      cwd: androidRoot,
      env,
      stdio: "inherit",
    });

gradle.on("error", (error) => {
  console.error(`Could not start the Android build: ${error.message}`);
  process.exitCode = 1;
});
gradle.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
