// src/components/nav/navbar.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white absolute top-0 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold flex gap-1 items-center">
              <img src="/v.svg" alt="Workflow Automation" className="w-6" />
              Vector AI
            </h1>
          </div>

          {session?.user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {session.user.email}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  signOut({ redirect: true, callbackUrl: "/sign-in" })
                }
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
