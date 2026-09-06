import { spawn, type ChildProcess } from "node:child_process";
import { constants } from "node:fs";
import { access, chmod } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type Go2RtcStartOptions = {
  binaryPath?: string;
  configPath?: string;
  workingDirectory?: string;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
};

export type Go2RtcStartResult = {
  pid: number;
  restarted: boolean;
  command: string;
};

let go2RtcProcess: ChildProcess | null = null;
let lastKnownBinaryPath: string | null = null;

const getModuleDirectory = () => {
  const currentFile = fileURLToPath(import.meta.url);
  return dirname(currentFile);
};

const getArchitecture = () => {
  if (process.env.PROC_ARCHITECTURE) {
    return process.env.PROC_ARCHITECTURE;
  }

  if (process.arch === "x64") {
    return "amd64";
  }

  return process.arch;
};

const getDefaultBinaryCandidates = () => {
  const moduleDir = getModuleDirectory();
  const binaryName = `go2rtc_linux_${getArchitecture()}`;

  return [
    resolve(moduleDir, `../../../goToRtc/${binaryName}`),
    resolve(process.cwd(), binaryName),
    resolve(process.cwd(), `./${binaryName}`),
    resolve(process.cwd(), `../${binaryName}`),
    resolve(moduleDir, `../../../../../go2rtc-binaries/${binaryName}`),
  ];
};

const getDefaultConfigPath = () => {
  const moduleDir = getModuleDirectory();
  return resolve(moduleDir, "../../../goToRtc/go2rtc.yaml");
};

const resolveBinaryPath = async (binaryPath?: string) => {
  const candidates = binaryPath ? [binaryPath] : getDefaultBinaryCandidates();

  for (const candidate of candidates) {
    const absolutePath = resolve(candidate);
    try {
      await access(absolutePath, constants.F_OK);
      return absolutePath;
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(
    `go2rtc binary not found. Tried: ${candidates.map((value) => resolve(value)).join(", ")}`,
  );
};

const ensureBinaryExecutable = async (binaryPath: string) => {
  try {
    await access(binaryPath, constants.X_OK);
  } catch {
    await chmod(binaryPath, 0o755);
  }
};

const runPkill = async (pattern: string): Promise<boolean> => {
  return new Promise((resolvePkill) => {
    const pkill = spawn("pkill", ["-f", pattern], {
      stdio: "ignore",
    });

    pkill.on("error", () => {
      resolvePkill(false);
    });

    pkill.on("close", (code) => {
      // 0: at least one process killed, 1: no process matched.
      resolvePkill(code === 0 || code === 1);
    });
  });
};

const isProcessRunning = () => {
  return Boolean(go2RtcProcess?.pid && !go2RtcProcess.killed);
};

export const stopGo2Rtc = async (): Promise<boolean> => {
  const binaryName = `go2rtc_linux_${getArchitecture()}`;

  if (!go2RtcProcess) {
    const byPath =
      lastKnownBinaryPath !== null ? await runPkill(lastKnownBinaryPath) : true;
    const byName = await runPkill(binaryName);
    return byPath && byName;
  }

  const processToStop = go2RtcProcess;

  const stoppedTrackedProcess = await new Promise<boolean>((resolveStop) => {
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      resolveStop(value);
    };

    processToStop.once("close", () => {
      if (go2RtcProcess === processToStop) {
        go2RtcProcess = null;
      }

      finish(true);
    });

    processToStop.once("error", () => {
      finish(false);
    });

    const terminated = processToStop.kill("SIGTERM");
    if (!terminated) {
      finish(false);
      return;
    }

    setTimeout(() => {
      const stillRunning =
        processToStop.exitCode === null && processToStop.signalCode === null;
      if (stillRunning) {
        processToStop.kill("SIGKILL");
      }
    }, 3_000);
  });

  const byPath =
    lastKnownBinaryPath !== null ? await runPkill(lastKnownBinaryPath) : true;
  const byName = await runPkill(binaryName);

  return stoppedTrackedProcess && byPath && byName;
};

export const startGo2Rtc = async (
  options: Go2RtcStartOptions = {},
): Promise<Go2RtcStartResult> => {
  const {
    configPath = getDefaultConfigPath(),
    workingDirectory,
    onStdout,
    onStderr,
  } = options;

  const binaryPath = await resolveBinaryPath(options.binaryPath);
  lastKnownBinaryPath = binaryPath;
  await ensureBinaryExecutable(binaryPath);

  const wasRunning = isProcessRunning();
  if (wasRunning) {
    await stopGo2Rtc();
  }

  const child = spawn(binaryPath, ["-config", configPath], {
    cwd: workingDirectory,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk: Buffer) => {
    onStdout?.(chunk.toString("utf8"));
  });

  child.stderr.on("data", (chunk: Buffer) => {
    onStderr?.(chunk.toString("utf8"));
  });

  child.on("close", () => {
    if (go2RtcProcess === child) {
      go2RtcProcess = null;
    }
  });

  child.on("error", () => {
    if (go2RtcProcess === child) {
      go2RtcProcess = null;
    }
  });

  go2RtcProcess = child;

  if (!child.pid) {
    throw new Error("go2rtc failed to start (missing process id)");
  }

  return {
    pid: child.pid,
    restarted: wasRunning,
    command: `${binaryPath} -config ${configPath}`,
  };
};

export const restartGo2Rtc = async (
  options: Go2RtcStartOptions = {},
): Promise<Go2RtcStartResult> => {
  await stopGo2Rtc();
  return startGo2Rtc(options);
};

export const getGo2RtcPid = (): number | null => {
  return go2RtcProcess?.pid ?? null;
};
