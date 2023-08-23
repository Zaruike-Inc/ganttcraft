import {NextResponse} from 'next/server';
import type {NextRequest} from "next/server";

export function middleware(request: NextRequest) {
    // Get the cookie for oauth the user
    const cookie = request.cookies.get('oauth');
    // Redirect the user to the correct uri
    if (request.url.includes('/login/callback')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    // If the cookie isn't here, you need to redirect the user to the login oauth
    if (!cookie) {
        // Redirect to the login page /login
        return NextResponse.redirect(new URL('/login', request.url))
    }
    // Build the base of response now
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login
         * - login/callback
         */
        '/((?!api|_next|static|_next/image|favicon.ico).*)',
        // '/(?!login)'
    ],
}
