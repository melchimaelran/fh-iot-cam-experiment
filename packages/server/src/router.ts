import { getCameraIp } from "./resolvers/getCameraIp.js";
import { hello } from "./resolvers/hello.js";
import { checkVulnByIp } from "./resolvers/checkVulnByIp.js";
import { router } from "./trpc.js";
import { setWifiCredentials } from "./resolvers/setWifiCredentials.js";
import { searchCameras } from "./resolvers/searchCameras.js";
import { getCameraList } from "./resolvers/getCameraList.js";

export const appRouter = router({
  // Queries
  hello,
  getCameraIp,
  checkVulnByIp,
  searchCameras,
  getCameraList,
  /// Mutations
  setWifiCredentials,
});

export type AppRouter = typeof appRouter;
