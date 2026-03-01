import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Middleware in Next.js runs on the Edge runtime which doesn't support the full Firebase Admin SDK easily out of the box without complicated setup.
    // For PRISM, we handle deep route protection on the client side via layout components, but we can do basic path checking here if needed.

    // As per React/Next.js and Firebase best practices, actual redirect logic based on Auth state is best placed inside the protected layout components or a root `AuthGuard` wrapper, because Firebase Auth state loads asynchronously on the client.

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/onboarding/:path*"
    ]
};
