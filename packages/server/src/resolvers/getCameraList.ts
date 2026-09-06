import {
  filterIpsByRtspReachability,
  getLocalNetworkIps,
  getMyIp,
} from "../tools/getLocalNetworkIps.js";
import { getRtspLinkByIp } from "../tools/global.js";
import { restartGo2Rtc } from "../tools/go2Rtc.js";
import { publicProcedure } from "../trpc.js";
import { rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type CameraInfo = {
  streamUrl: string;
  name: string;
  ip: string;
  status?: "online" | "offline";
  imagePreviewUrl: string;
};

export const getCameraList = publicProcedure.query(async () => {
  const cameraList: CameraInfo[] = [];
  const localIps = getLocalNetworkIps();
  const reachableCameraIps = await filterIpsByRtspReachability(localIps);
  if (reachableCameraIps.length === 0) {
    return cameraList;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);
  const yamlFilePath = resolve(currentDir, "../../../goToRtc/go2rtc.yaml");

  const yamlConfig = [
    "streams:",
    ...reachableCameraIps.map((ip, index) => {
      const rtspUrl = getRtspLinkByIp(ip);
      return `  camera${index + 1}: "${rtspUrl}"`;
    }),
  ].join("\n");

  await rm(yamlFilePath, { force: true });
  await writeFile(yamlFilePath, `${yamlConfig.trim()}\n`, "utf8");

  const myIp = getMyIp();

  for (const [index, ip] of reachableCameraIps.entries()) {
    cameraList.push({
      ip,
      name: `camera${index + 1}`,
      streamUrl: `http://${myIp}:1984/stream.html?src=camera${index + 1}&mode=webrtc`,
      status: "online",
      imagePreviewUrl: `http://${myIp}:1984/api/frame.jpeg?src=camera${index + 1}`,
    });
  }

  await restartGo2Rtc();
  //   await stopGo2Rtc();

  return cameraList;
});
