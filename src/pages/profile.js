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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

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
    profilePicture: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          console.log("Fetching user data for email:", session.user.email);
          const response = await fetch(
            `/api/user/profile?email=${session.user.email}&t=${Date.now()}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched user data:", data);

          if (data) {
            setUserData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              profilePicture: data.profilePicture || "",
            });
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              profilePicture: data.profilePicture || "",
            });
            setIsAdmin(data.role === "admin" || data.role === "super-admin");
          } else {
            console.warn("No data returned from API");
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
          toast({
            title: "Error",
            description: `Failed to load profile data: ${error.message}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
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

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${session.user.email}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(`avatars/${fileName}`, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      const profilePictureUrl = `https://pnglcnwerkxshicljpet.supabase.co/storage/v1/object/public/profile-pictures/${data.path}`;
      console.log("Generated profilePictureUrl:", profilePictureUrl);

      setFormData((prev) => ({ ...prev, profilePicture: profilePictureUrl }));
      setUserData((prev) => ({ ...prev, profilePicture: profilePictureUrl }));

      const payload = {
        email: session.user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePicture: profilePictureUrl,
      };
      console.log("Sending PUT payload:", payload);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("PUT response:", responseData);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            responseData.error || "Unknown error"
          }`
        );
      }

      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      toast({
        title: "Error",
        description: `Failed to upload profile picture: ${error.message}`,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: session.user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePicture: formData.profilePicture,
      };
      console.log("Sending PUT payload (form submit):", payload);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("PUT response (form submit):", responseData);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            responseData.error || "Unknown error"
          }`
        );
      }

      setUserData({
        firstName: responseData.user.firstName,
        lastName: responseData.user.lastName,
        email: responseData.user.email,
        phone: responseData.user.phone,
        profilePicture: responseData.user.profilePicture || "",
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-10">
        <div className="grid gap-6">
          <div className="flex items-center space-x-4">
            <label className="relative cursor-pointer">
              <Avatar className="h-24 w-24 border-4 border-primary">
                {userData.profilePicture ? (
                  <AvatarImage src={userData.profilePicture} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {userData.firstName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleProfilePictureUpload}
              />
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2">
                <Upload className="h-4 w-4" />
              </div>
            </label>
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="dark:text-gray-300 text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                {userData.email}
              </p>
              {isUploading && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs dark:text-gray-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full dark:bg-gray-700 bg-gray-200">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {userData.profilePicture && !isUploading && (
                <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Profile picture uploaded
                </div>
              )}
            </div>
          </div>

          <Card className="border dark:border-gray-700 shadow-lg dark:bg-gray-900/50 bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <CardTitle className="flex items-center text-xl font-bold dark:text-white text-gray-900">
                <User className="h-5 w-5 mr-2 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription className="dark:text-gray-400 text-gray-600">
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
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="dark:border-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium dark:text-gray-300 text-gray-700">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      First Name
                    </div>
                    <div className="dark:text-white text-gray-900">
                      {userData.firstName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium dark:text-gray-300 text-gray-700">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      Last Name
                    </div>
                    <div className="dark:text-white text-gray-900">
                      {userData.lastName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium dark:text-gray-300 text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      Email
                    </div>
                    <div className="dark:text-white text-gray-900">
                      {userData.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium dark:text-gray-300 text-gray-700">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      Phone Number
                    </div>
                    <div className="dark:text-white text-gray-900">
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
