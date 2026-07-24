import { jwtVerify } from "jose";

export async function verifyTokenEdge(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload; // returns the decoded data
  } catch (err) {
    return null;
  }
}
