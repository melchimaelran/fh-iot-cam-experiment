import z from "zod";
import { publicProcedure } from "../trpc.js";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { wait } from "../tools/global.js";

const getWifiConfigContent = (ssid: string, pwd: string, authType: string) => {
  return [
    "DHCP=yes",
    `WIFI_SSID=${ssid}`,
    `WIFI_SECURITY=${authType}`,
    `WIFI_PSK=${pwd}`,
  ].join("\n");
};

const TELNET_FILE_PATH = "/app/userdata/ifcfg.wlan0";

export const setWifiCredentials = publicProcedure
  .input(
    z.object({
      ip: z.string(),
      ssid: z.string(),
      password: z.string(),
      authType: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { ip, ssid, password, authType } = input;
    if (!ssid || !password || !authType) {
      throw new Error("SSID, password and authType are required");
    }
    // Here you would implement the logic to set the Wi-Fi credentials on the camera
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFile);
    const scriptPath = resolve(currentDir, "../../../exploit/quickRoot.sh");
    /// chmod +x the script to make sure it is executable
    spawn("chmod", ["+x", scriptPath]).on("close", (code) => {
      if (code !== 0) {
        throw new Error(
          `Failed to chmod quickRoot.sh, exited with code ${code}`,
        );
      }
    });

    const child = spawn("bash", [scriptPath, ip], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    const timeoutId = setTimeout(() => {
      child.kill("SIGKILL");
    }, 30_000);

    const closePromise = new Promise<void>((resolve, reject) => {
      child.on("error", (error) => {
        reject(error);
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(
            new Error(stderr || stdout || `telnet exited with code ${code}`),
          );
          return;
        }

        resolve();
      });
    });

    const wifiConfigContent = getWifiConfigContent(ssid, password, authType);

    await wait(2000);
    child.stdin.write("root\n");
    await wait(2000);
    child.stdin.write("root\n");
    await wait(2000);
    child.stdin.write(`rm -f ${TELNET_FILE_PATH}\n`);
    await wait(1000);
    child.stdin.write(`vi ${TELNET_FILE_PATH}\n`);
    await wait(2000);
    child.stdin.write("i");
    await wait(2000);
    child.stdin.write(`${wifiConfigContent}\n`);
    await wait(2000);
    child.stdin.write("\u001b");
    await wait(2000);
    child.stdin.write(":wq\n");
    await wait(2000);
    child.stdin.write(
      `echo root:root | chpasswd; cp /etc/shadow /app/userdata/shadow; cd /app; /app/app_shadow.sh`,
    );
    await wait(2000);
    child.stdin.write("exit\n");
    child.stdin.end();

    try {
      await closePromise;
    } finally {
      clearTimeout(timeoutId);
    }

    const combinedOutput = `${stdout}\n${stderr}`;
    const errorPatterns = [
      /login incorrect/i,
      /authentication failed/i,
      /permission denied/i,
      /not found/i,
      /no such file or directory/i,
      /write error/i,
    ];

    const detectedError = errorPatterns.find((pattern) =>
      pattern.test(combinedOutput),
    );
    if (detectedError) {
      throw new Error(combinedOutput.trim() || "Telnet session failed");
    }

    const returnValueConfig = wifiConfigContent;

    if (!returnValueConfig) {
      throw new Error(
        `The file ${TELNET_FILE_PATH} is empty or could not be read`,
      );
    }

    return returnValueConfig;
  });
