import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
// import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
});
