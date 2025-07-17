import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { findValidSession } from "@/lib/db"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export interface SessionPayload {
  userId: string
  username: string
  expiresAt: Date
}

export async function createSession(userId: string, username: string) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  const session = await encrypt({ userId, username, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set("admin-session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(secret)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, secret, {
      algorithms: ["HS256"],
    })
    return payload as SessionPayload
  } catch (error) {
    console.log("Failed to verify session")
    return null
  }
}

export async function verifySession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("admin-session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return null
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    return null
  }

  return { userId: session.userId, username: session.username }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("admin-session")
}

export async function getAdminSession() {
  const sessionToken = cookies().get("admin-session")?.value
  if (!sessionToken) {
    return null
  }

  const session = await findValidSession(sessionToken)
  return session
}
