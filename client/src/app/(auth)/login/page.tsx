// app/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();


  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => signIn("google")}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => signIn("discord")}
          >
            <Icons.discord className="mr-2 h-4 w-4" />
            Continue with Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}