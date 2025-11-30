import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/verifyToken";
import User from "@/model/UserSchema";
import { connectDB } from "@/lib/mongoose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(path);
  const protectedRoutes = ["/dashboard"];

  const decoded = token ? await verifyTokenEdge(token) : null;

  // If logged in and trying to visit login/signup
  // if (decoded && isAuthPage) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  // If route is protected, verify access rules
  if (protectedRoutes.includes(path)) {
    if (!decoded) {
      return NextResponse.redirect(new URL("/", req.url));
    }


  
      
       

  }

  return NextResponse.next();
}
