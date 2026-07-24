import { SignJWT } from "jose";

export async function generateToken(userId: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  const token = await new SignJWT({ id: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}
