// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/workflows', req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith('/workflows')) {
          return token !== null;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/workflows/:path*', '/sign-in'],
};