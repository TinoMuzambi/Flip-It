import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const flippersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const flippers = await ctx.prisma.flipper.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: flippers.map((flipper) => flipper.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return flippers.map((flipper) => {
      const author = users.find((user) => user.id === flipper.authorId);

      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for flipper not found",
        });

      return {
        flipper,
        author,
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        question: z.string().min(1).max(1000),
        answer: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const flipper = await ctx.prisma.flipper.create({
        data: {
          authorId,
          question: input.question,
          answer: input.answer,
        },
      });

      return flipper;
    }),
});
