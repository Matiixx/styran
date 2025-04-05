import { env } from "~/env";
import { db } from "../db";

export const customLogin = async (
  uid: string,
  login: string,
  password: string,
) => {
  if (uid && login && password) {
    if (login !== env.CUSTOM_LOGIN || password !== env.CUSTOM_PASSWORD) {
      return null;
    }

    const maybeUser = await db.user.findUnique({ where: { id: uid } });

    if (!maybeUser) {
      return null;
    }

    return maybeUser;
  }

  return null;
};
