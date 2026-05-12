import z from "zod";
import { publicProcedure } from "../trpc.js";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const runVulnCheckByIp = (ip: string): Promise<string> => {
  return new Promise((resolvePromise, reject) => {
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFile);
    const scriptPath = resolve(currentDir, "../../../exploit/vuln.sh");
    /// chmod +x the script to make sure it is executable
    spawn("chmod", ["+x", scriptPath]).on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Failed to chmod vuln.sh, exited with code ${code}`));
        return;
      }
    });

    const child = spawn("bash", [scriptPath, "check", ip], {
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
      child.kill();
      reject(new Error("vuln.sh timed out after 30 seconds"));
    }, 30_000);

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeoutId);
      if (code !== 0) {
        reject(new Error(stderr || `vuln.sh exited with code ${code}`));
        return;
      }

      resolvePromise(stdout);
    });

    child.stdin.write("n\nn\nn\n");
    child.stdin.end();
  });
};

export const checkVulnByIp = publicProcedure
  .input(
    z.object({
      ip: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { ip } = input;
    if (!ip) {
      throw new Error("IP address is required");
    }

    const output = await runVulnCheckByIp(ip);
    const regexSuccess = /Telnet is available on port/i;
    const success = regexSuccess.test(output);
    return { output, success };
  });
