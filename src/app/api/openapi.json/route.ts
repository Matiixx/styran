import { type NextRequest } from "next/server";
import { openApiDocument } from "~/server/api/openapi";

// Respond with our OpenAPI schema
const handler = (_req: NextRequest) => {
  return Response.json(openApiDocument);
};

export { handler as GET };
