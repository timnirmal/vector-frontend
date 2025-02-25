// src/app/sign-in/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Try demo@example.com / demo123");
      setIsLoading(false);
    } else {
      router.push("/workflows");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
         <div className="flex-1 flex items-center justify-center bg-[#DEE6E5]">
        <Card className="w-full max-w-md bg-transparent">
          <CardHeader className="space-y-2">
            <h3 className="text-3xl text-center m-auto tracking-tight flex gap-2"><img
          src="/v.svg"
          alt="Workflow Automation"
          className="w-8"
        />Vector AI</h3>
            <CardDescription className="text-center text-md">
              Enter your credentials to access the demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="border border-red-400 p-3">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-sm text-center text-gray-500 mt-4">
                Demo credentials: demo@example.com / demo123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex lg:w-1/2 bg-[#38415A] relative">
        <div className="absolute inset-0" />

        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
        >
          <source src="/ds.mp4" type="video/mp4" />
        </video>
        <img
          src="/signin.png"
          alt="Workflow Automation"
          className="absolute bottom-0 -left-36 z-10"
        />
        <div className="absolute top-0 left-[230px] p-8 text-white opacity-80">
          <h2 className="text-5xl font-bold mb-2 leading-tight text-left tracking-">
            Let AI Agents {<br/>}Manage Your{<br/>} Business{<br/>} Effortlessly
          </h2>
        </div>
        <p className="absolute bottom-8 z-20 right-8 opacity-60 text-right w-1/2 float-right  text-white">
          Streamline operations, boost efficiency, and achieve more with intelligent automation tailored to your needs
          </p>
      </div>

     
    </div>
  );
}
