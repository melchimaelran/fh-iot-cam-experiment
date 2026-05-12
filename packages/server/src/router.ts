import { getCameraIp } from "./resolvers/getCameraIp.js";
import { hello } from "./resolvers/hello.js";
import { checkVulnByIp } from "./resolvers/checkVulnByIp.js";
import { router } from "./trpc.js";
import { setWifiCredentials } from "./resolvers/setWifiCredentials.js";

export const appRouter = router({
  hello,
  getCameraIp,
  checkVulnByIp,
  /// Mutations
  setWifiCredentials,
});

export type AppRouter = typeof appRouter;
