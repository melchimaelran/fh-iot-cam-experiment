import { filterIpsByRtspReachability, getLocalNetworkIps } from "../tools/getLocalNetworkIps.js";

import { publicProcedure } from "../trpc.js";




export const searchCameras = publicProcedure.query(async () => {
  const localIps = getLocalNetworkIps();
  // Rtsp link example : rtsp://admin:admin123456@[ipaddress]:8554/profile1
  const reachableIps = await filterIpsByRtspReachability(localIps);

  return { localIps, reachableIps };
});
