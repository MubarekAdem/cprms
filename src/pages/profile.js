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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);

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
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
            });
            setIsAdmin(data.role === "admin" || data.role === "super-admin");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
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
  }, [session, status, router, toast]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUserData({
        firstName: updatedUser.user.firstName,
        lastName: updatedUser.user.lastName,
        email: updatedUser.user.email,
        phone: updatedUser.user.phone,
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

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
            <Avatar className="h確-24 w-24 border-4 border-primary">
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
              {isEditing && isAdmin ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
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
                  {isAdmin && (
                    <div className="col-span-2">
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
