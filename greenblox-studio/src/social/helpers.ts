import { NextResponse } from "next/server";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-gbtoken",
};

export function corsOptionsHandler() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function apiJson(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, { ...init, headers: { ...CORS_HEADERS, ...(init.headers ?? {}) } });
}
