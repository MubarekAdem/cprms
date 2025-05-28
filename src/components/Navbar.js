"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  UserCog,
  Hospital,
  MapPin,
  LayoutDashboard,
  User,
  LogOut,
  UserPlus,
  Stethoscope,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import ThemeToggle from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    profilePicture: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  useEffect(() => {
    console.log("Navbar useEffect - Session:", session, "Status:", status);
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
              profilePicture: data.profilePicture || "",
              role: data.role || "None",
            });
          } else {
            console.warn("No data returned from API");
            toast.error("Failed to load user profile");
          }
        } catch (error) {
          console.error("Error fetching user data in Navbar:", error.message);
          toast.error("Error loading user profile");
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("Not authenticated or no email, skipping fetch");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  const navItems = [
    { icon: LayoutDashboard, label: "DASHBOARD", href: "/admin-dashboard" },
    { icon: UserCog, label: "DOCTORS", href: "/admin-doctor" },
    { icon: UserCog, label: "FIRST AIDS", href: "/admin-first-aid" },
    { icon: UserCog, label: "REGISTRARS", href: "/admin-registrar" },
    { icon: Hospital, label: "HOSPITALS", href: "/admin-hospitals" },
    { icon: MapPin, label: "CITIES", href: "/admin-cities" },
  ];

  const doctorNavItems = [
    { icon: Stethoscope, label: "DASHBOARD", href: "/doctor" },
  ];

  const registrarNavItems = [
    { icon: UserPlus, label: "HOME", href: "/registrar" },
    { icon: UserPlus, label: "ADD PATIENT", href: "/registrar-patient-add" },
    {
      icon: UserPlus,
      label: "ADD EXISTING PATIENT",
      href: "/registrar-existing-add",
    },
  ];

  const defaultNavItems = [
    // { icon: LayoutDashboard, label: "NOTIFICATIONS", href: "/notifications" },
    { icon: User, label: "PROFILE", href: "/profile" },
  ];

  const getNavItems = () => {
    switch (userData.role) {
      case "admin":
        return navItems;
      case "doctor":
        return doctorNavItems;
      case "registrar":
        return registrarNavItems;
      case "first-aid":
      case "None":
        return defaultNavItems;
      default:
        return defaultNavItems;
    }
  };

  const handleSignOut = () => {
    setIsSignOutDialogOpen(false);
    signOut({ callbackUrl: "/" })
      .then(() => {
        toast.success("Signed out successfully");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
      });
  };

  if (status === "loading" || isLoading) {
    return (
      <aside className="w-64 border-r bg-background p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse flex items-center space-x-2">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex flex-col space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-background p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10">
            {userData.profilePicture ? (
              <AvatarImage src={userData.profilePicture} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {userData.firstName?.charAt(0).toUpperCase() ||
                  session?.user?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {userData.firstName || session?.user?.name || "User"}{" "}
              {userData.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {userData.role || "No role"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/profile")}
            className="text-muted-foreground hover:text-primary"
            aria-label="View profile"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="space-y-4 flex-grow">
        {getNavItems().map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 ${
                pathname === item.href
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {session?.user?.email || "No email"}
          </p>
          <Dialog
            open={isSignOutDialogOpen}
            onOpenChange={setIsSignOutDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white text-black">
              <DialogHeader>
                <DialogTitle className="text-black">
                  Confirm Sign Out
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Are you sure you want to sign out? You will be redirected to
                  the homepage.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSignOutDialogOpen(false)}
                  className="text-black border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  aria-label="Confirm sign out"
                >
                  Sign Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </aside>
  );
}
