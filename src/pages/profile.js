"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { User, Mail, Phone } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch(
            `/api/user/profile?email=${session.user.email}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();

          if (data) {
            setUserData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      fetchUserData();
    }
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-10">
        <div className="grid gap-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {userData.firstName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                {userData.email}
              </p>
            </div>
          </div>

          <Card className="border shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                <User className="h-5 w-5 mr-2 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your personal information on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    First Name
                  </div>
                  <div className="text-gray-900">{userData.firstName}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Last Name
                  </div>
                  <div className="text-gray-900">{userData.lastName}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    Email
                  </div>
                  <div className="text-gray-900">{userData.email}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    Phone Number
                  </div>
                  <div className="text-gray-900">
                    {userData.phone || "Not provided"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
