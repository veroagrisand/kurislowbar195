import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "replace-this-secret")

export interface SessionPayload {
  userId: number
  username: string
  exp: number
}

/* ------------ CREATE + STORE SESSION ------------ */
export async function createSession(userId: number, username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 // 1 h in seconds

  const token = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .sign(secret)

  cookies().set("admin-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  })

  return token
}

/* ------------ VERIFY SESSION COOKIE ------------ */
export async function verifySession(): Promise<SessionPayload | null> {
  const raw = cookies().get("admin-session")?.value
  if (!raw) return null

  try {
    const { payload } = await jwtVerify<SessionPayload>(raw, secret, {
      algorithms: ["HS256"],
    })
    return payload
  } catch {
    return null
  }
}

/* ------------ DESTROY SESSION ------------ */
export function deleteSession() {
  cookies().delete("admin-session")
}
