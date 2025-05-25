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
import {
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Heart,
  UserPlus,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState({
    about: false,
    contact: false,
    login: false,
    signup: false,
  });
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.requiresOTP) {
        setRequiresOTP(true);
        toast.success("OTP sent to your email");
      } else {
        toast.success("Signup successful! You can now log in.");
        router.push("/login");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavClick = async (path, key) => {
    setIsNavLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await router.push(path);
    } finally {
      setIsNavLoading((prev) => ({ ...prev, [key]: false }));
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b dark:border-primary/20 border-primary/10 dark:bg-gray-900/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart className="h-8 w-8 text-primary mr-2" />
                <span className="font-bold text-xl text-primary">
                  ETHIO-CPRMS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="dark:text-gray-300">
                <ThemeToggle />
              </div>

              <Link
                href="/#about"
                className="dark:text-gray-300 text-gray-600 hover:text-primary transition-colors"
                onClick={() => handleNavClick("/about", "about")}
              >
                {isNavLoading.about ? (
                  <Loader2 className="h-4 w-4 animate-spin inline-block" />
                ) : (
                  "About"
                )}
              </Link>
              <Link
                href="/#contact"
                className="dark:text-gray-300 text-gray-600 hover:text-primary transition-colors"
                onClick={() => handleNavClick("/contact", "contact")}
              >
                {isNavLoading.contact ? (
                  <Loader2 className="h-4 w-4 animate-spin inline-block" />
                ) : (
                  "Contact"
                )}
              </Link>
              <Link
                href="/login"
                onClick={() => handleNavClick("/login", "login")}
              >
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                  disabled={isNavLoading.login}
                >
                  {isNavLoading.login ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </Link>
              <Link
                href="/signup"
                onClick={() => handleNavClick("/signup", "signup")}
              >
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isNavLoading.signup}
                >
                  {isNavLoading.signup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden dark:bg-gray-900/90 bg-white/90">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="px-3 py-2">
                <div className="dark:text-gray-300">
                  <ThemeToggle />
                </div>
              </div>
              <Link
                href="/#about"
                className="block px-3 py-2 rounded-md text-base font-medium dark:text-gray-300 text-gray-700 hover:text-primary hover:bg-primary/10"
                onClick={() => handleNavClick("/about", "about")}
              >
                {isNavLoading.about ? (
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                ) : (
                  "About"
                )}
              </Link>
              <Link
                href="/#contact"
                className="block px-3 py-2 rounded-md text-base font-medium dark:text-gray-300 text-gray-700 hover:text-primary hover:bg-primary/10"
                onClick={() => handleNavClick("/contact", "contact")}
              >
                {isNavLoading.contact ? (
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                ) : (
                  "Contact"
                )}
              </Link>
              <Link
                href="/login"
                onClick={() => handleNavClick("/login", "login")}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary hover:bg-primary/10"
                  disabled={isNavLoading.login}
                >
                  {isNavLoading.login ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </Link>
              <Link
                href="/signup"
                onClick={() => handleNavClick("/signup", "signup")}
              >
                <Button
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-white"
                  disabled={isNavLoading.signup}
                >
                  {isNavLoading.signup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md dark:bg-gray-900/50 bg-white/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {requiresOTP ? "Verify Email" : "Sign Up"}
              </CardTitle>
              <CardDescription className="text-center dark:text-gray-400">
                {requiresOTP
                  ? "Enter the 4-digit code sent to your email"
                  : "Create an account to get started"}
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
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Abebe"
                            className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Kebede"
                            className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="m@example.com"
                          className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="123-456-7890"
                          className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          value={form.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        name="otp"
                        placeholder="Enter 4-digit code"
                        className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={form.otp}
                        onChange={handleChange}
                        required
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {requiresOTP ? "Verifying..." : "Signing Up..."}
                    </>
                  ) : requiresOTP ? (
                    "Verify"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </CardContent>
            </form>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80"
                  onClick={() => handleNavClick("/login", "login")}
                >
                  {isNavLoading.login ? (
                    <Loader2 className="h-4 w-4 animate-spin inline-block" />
                  ) : (
                    "Sign in"
                  )}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
