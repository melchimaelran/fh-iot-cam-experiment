import { z } from "zod";
import { publicProcedure } from "../trpc.js";

export const hello = publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return { message: `Hello ${input.name}` };
  });
