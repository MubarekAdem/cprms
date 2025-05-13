"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Hospital,
  BadgeIcon as IdCard,
} from "lucide-react";
import Link from "next/link";

export default function RolesSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    hospital: "",
    registrarId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (form.role === "registrar" && form.email) {
      const fetchRegistrarData = async () => {
        try {
          const res = await fetch("/api/registrars");
          const data = await res.json();

          if (res.ok) {
            const registrar = data.find(
              (registrar) => registrar.email === form.email
            );
            if (registrar) {
              setForm((prev) => ({
                ...prev,
                hospital: registrar.hospital,
                registrarId: registrar.registrarId,
              }));
            } else {
              toast.error("Registrar not found with this email.");
            }
          } else {
            throw new Error("Failed to fetch registrar data.");
          }
        } catch (error) {
          toast.error(error.message);
        }
      };

      fetchRegistrarData();
    }
  }, [form.role, form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/roles-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up
          </CardTitle>
          <CardDescription className="text-center">
            Create an account with your role
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Abebe"
                    className="pl-10"
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
                    placeholder="kebede"
                    className="pl-10"
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
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
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
                  placeholder="123-456-7890"
                  className="pl-10"
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select onValueChange={handleRoleChange} value={form.role}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="first-aid">
                      First Aid Responder
                    </SelectItem>
                    <SelectItem value="registrar">Registrar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.role === "registrar" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <div className="relative">
                    <Hospital className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hospital"
                      name="hospital"
                      placeholder="Hospital Name"
                      className="pl-10"
                      value={form.hospital}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrarId">Registrar ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="registrarId"
                      name="registrarId"
                      placeholder="Registrar ID"
                      className="pl-10"
                      value={form.registrarId}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
