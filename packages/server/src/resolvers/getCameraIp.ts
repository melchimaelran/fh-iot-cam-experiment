import { publicProcedure } from "../trpc.js";
import { exec } from "node:child_process";

//// Function to get the gateway IP of the camera by executing the command "ip route" and parsing the output
const getGatewayIpOfTheCamera = (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    exec("ip route", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      // Example output: default via 192.168.88.1 dev wlo1 proto dhcp src 192.168.88.247 metric 600
      // 192.168.88.0/24 dev wlo1 proto kernel scope link src 192.168.88.247 metric 600

      /// Regex to get the IP address after default via
      const match = stdout.match(/default via ([\d.]+)/);
      if (match && match[1]) {
        resolve(match[1]);
      } else {
        resolve(null);
      }
    });
  });
};

export const getCameraIp = publicProcedure.query(async () => {
  try {
    const gatewayIp = await getGatewayIpOfTheCamera();
    return { ip: gatewayIp };
  } catch (error) {
    console.error("Error getting camera IP:", error);
    return { ip: null };
  }
});
