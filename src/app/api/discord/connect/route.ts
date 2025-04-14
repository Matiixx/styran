import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Generate a random state for security
  const state = crypto.randomUUID();

  // Store the state in a cookie for verification
  const stateCookie = `discord_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`;

  // Create the OAuth2 URL with just the identify and email scopes for basic user info
  const params = new URLSearchParams({
    client_id: env.AUTH_DISCORD_ID,
    redirect_uri: `${request.nextUrl.origin}/api/discord/callback`,
    response_type: "code",
    scope: "identify email",
    state,
  });

  const headers = new Headers();
  headers.append("Set-Cookie", stateCookie);

  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
    { headers },
  );
}
