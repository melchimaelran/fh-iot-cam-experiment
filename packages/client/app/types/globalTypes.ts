import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/src/router";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
