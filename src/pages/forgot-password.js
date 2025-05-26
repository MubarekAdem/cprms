"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const isOtpVerification = requiresOTP;
    if (isOtpVerification) {
      setIsVerifyingOtp(true);
    } else {
      setIsSendingResetLink(true);
    }

    try {
      const endpoint = requiresOTP
        ? "/api/auth/verify-reset-otp"
        : "/api/auth/forgot-password-web";
      const body = requiresOTP ? { email, otp } : { email };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (!requiresOTP) {
        setRequiresOTP(true);
        toast.success("OTP sent to your email");
      } else {
        toast.success("OTP verified successfully");
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`
        );
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      if (isOtpVerification) {
        setIsVerifyingOtp(false);
      } else {
        setIsSendingResetLink(false);
      }
    }
  };

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-gradient-to-br from-primary/10 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {requiresOTP ? "Verify OTP" : "Forgot Password"}
              </CardTitle>
              <CardDescription className="text-center">
                {requiresOTP
                  ? "Enter the verification code sent to your email"
                  : "Enter your email to reset your password"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {!requiresOTP ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        className="pl-10"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSendingResetLink || isVerifyingOtp}
                >
                  {requiresOTP ? (
                    isVerifyingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )
                  ) : isSendingResetLink ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </CardContent>
            </form>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
