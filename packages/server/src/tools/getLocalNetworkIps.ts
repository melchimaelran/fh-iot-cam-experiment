import { execSync } from "node:child_process";
import { Socket } from "node:net";
import { getRtspLinkByIp } from "./global.js";

const RTSP_PORT = 8554;
const RTSP_TIMEOUT_MS = 1500;
const RTSP_AUTH_B64 = Buffer.from("admin:admin123456").toString("base64");
const TELNET_PORT = 23;
const TELNET_TIMEOUT_MS = 1200;

function getSubnet(): string {
  const defaultRoute = execSync("ip -o -4 route show to default").toString();
  const ifaceMatch = defaultRoute.match(/\bdev\s+(\S+)/);

  if (!ifaceMatch?.[1]) {
    throw new Error("Active network interface not found");
  }

  const iface = ifaceMatch[1];
  const routeOutput = execSync(
    `ip -o -4 route show dev ${iface} scope link`,
  ).toString();

  const match = routeOutput.match(/(\d+\.\d+\.\d+\.\d+\/\d+)/);

  if (!match?.[1]) {
    throw new Error(`Subnet not found for interface ${iface}`);
  }

  return match[1];
}

export function getLocalNetworkIps(): string[] {
  const subnet = getSubnet();
  console.log("debug subnet ", subnet);

  const output = execSync(`nmap -sn ${subnet}`).toString();

  const regex = /Nmap scan report for (?:(?:.+) )?\(?(\d+\.\d+\.\d+\.\d+)\)?/g;

  const ips: string[] = [];

  let match: RegExpExecArray | null;

  while ((match = regex.exec(output)) !== null) {
    if (match[1]) {
      ips.push(match[1]);
    }
  }

  return ips;
}

export async function isRtspReachable(ip: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    let settled = false;
    let responseBuffer = "";

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(RTSP_TIMEOUT_MS);

    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));

    socket.connect(RTSP_PORT, ip, () => {
      const rtspUrl = getRtspLinkByIp(ip);
      const request = [
        `OPTIONS ${rtspUrl} RTSP/1.0`,
        "CSeq: 1",
        "User-Agent: fh-iot-cam-server",
        `Authorization: Basic ${RTSP_AUTH_B64}`,
        "",
        "",
      ].join("\r\n");

      socket.write(request);
    });

    socket.on("data", (chunk) => {
      responseBuffer += chunk.toString("utf8");

      if (!responseBuffer.includes("\r\n")) {
        return;
      }

      const firstLine = responseBuffer.split("\r\n", 1)[0] ?? "";
      finish(/^RTSP\/1\.0\s+\d{3}/.test(firstLine));
    });
  });
}

export async function isTelnetReachable(ip: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(TELNET_TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
    socket.connect(TELNET_PORT, ip);
  });
}

export const getMyIp = (): string => {
  const defaultRoute = execSync("ip -o -4 route show to default").toString();
  const interfaceMatch = defaultRoute.match(/\bdev\s+(\S+)/);

  if (!interfaceMatch?.[1]) {
    throw new Error("Active network interface not found");
  }

  const iface = interfaceMatch[1];
  const addrOutput = execSync(`ip -o -4 addr show dev ${iface}`).toString();
  const ipMatch = addrOutput.match(/\binet\s+(\d+\.\d+\.\d+\.\d+)\//);

  if (!ipMatch?.[1]) {
    throw new Error(`IPv4 address not found for interface ${iface}`);
  }

  return ipMatch[1];
};

export async function filterIpsByRtspReachability(
  ips: string[],
): Promise<string[]> {
  const maxConcurrency = 30;
  const reachable: boolean[] = new Array(ips.length).fill(false);
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;

      if (index >= ips.length) {
        return;
      }

      const ip = ips[index];
      if (!ip) {
        continue;
      }

      reachable[index] =
        (await isTelnetReachable(ip)) && (await isRtspReachable(ip));
    }
  };

  const workerCount = Math.min(maxConcurrency, ips.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return ips.filter((_, index) => reachable[index]);
}
