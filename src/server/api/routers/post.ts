import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const postRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({ openapi: { method: "POST", path: "/hello" } })
    .input(z.object({ text: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.text}` };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({}) => {
      return [];
    }),

  getLatest: protectedProcedure.query(async ({}) => {
    return [];
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

export default postRouter;
