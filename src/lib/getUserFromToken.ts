import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function getUserFromToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}
