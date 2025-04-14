import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
  verified?: boolean;
  global_name?: string;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Verify state
  const storedState = request.cookies.get("discord_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/my-profile?error=oauth_state_mismatch", request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/my-profile?error=no_code", request.url),
    );
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.AUTH_DISCORD_ID,
        client_secret: env.AUTH_DISCORD_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${new URL(request.url).origin}/api/discord/callback`,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error(
        "Discord token exchange failed:",
        await tokenResponse.text(),
      );
      return NextResponse.redirect(
        new URL("/my-profile?error=token_exchange", request.url),
      );
    }

    const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;
    const { access_token } = tokenData;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error(
        "Discord user info fetch failed:",
        await userResponse.text(),
      );
      return NextResponse.redirect(
        new URL("/my-profile?error=user_info", request.url),
      );
    }

    const userData = (await userResponse.json()) as DiscordUserResponse;

    // Store Discord info in the user's account
    await db.user.update({
      where: { id: session.user.id },
      data: {
        discordId: userData.id,
        discordAccessToken: access_token,
      },
    });

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      "discord_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    );

    return NextResponse.redirect(
      new URL("/my-profile?discord=connected", request.url),
      { headers },
    );
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.redirect(
      new URL("/my-profile?error=unknown", request.url),
    );
  }
}
