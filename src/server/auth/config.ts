import "next-auth/jwt";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import {
  CredentialsSignin,
  type DefaultSession,
  type NextAuthConfig,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { INVALID_CREDENTIALS } from "~/lib/errorCodes";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface User {
    firstName?: string;
    lastName?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"] &
      User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string;
    lastName?: string;
  }
}

class CredentialsError extends CredentialsSignin {
  code = INVALID_CREDENTIALS;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const maybeUser = await db.user.findFirst({
          where: { email: credentials.email as string },
        });

        if (!maybeUser) {
          throw new CredentialsError();
        }

        const passwordsMatch = await compare(
          credentials.password as string,
          maybeUser.password,
        );

        if (!passwordsMatch) {
          throw new CredentialsError();
        }

        return maybeUser;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { newUser: "/register" },
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "",
          firstName: token.firstName,
          lastName: token.lastName,
        },
      };
    },

    jwt: ({ token, user }) => {
      if (user) {
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
