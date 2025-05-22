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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

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
              role: data.role || "",
            });
          } else {
            console.warn("No data returned from API");
          }
        } catch (error) {
          console.error("Error fetching user data in Navbar:", error.message);
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
    { icon: UserCog, label: "DOCTORS", href: "/admin-doctor" },
    { icon: UserCog, label: "First Aids", href: "/admin-first-aid" },
    { icon: UserCog, label: "Registrars", href: "/admin-registrar" },
    { icon: Hospital, label: "Hospitals", href: "/admin-hospitals" },
    { icon: MapPin, label: "Cities", href: "/admin-cities" },
    { icon: LayoutDashboard, label: "DASHBOARD", href: "/admin-dashboard" },
  ];

  const doctorNavItems = [];

  const registrarNavItems = [
    {
      icon: UserPlus,
      label: "HOME",
      href: "/registrar",
    },

    { icon: UserPlus, label: "ADD PATIENT", href: "/registrar-patient-add" },

    {
      icon: UserPlus,
      label: "ADD EXISTING PATIENT",
      href: "/registrar-existing-add",
    },
  ];

  const getNavItems = () => {
    switch (userData.role) {
      case "admin":
        return navItems;
      case "doctor":
        return doctorNavItems;
      case "registrar":
        return registrarNavItems;
      default:
        return [];
    }
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
                {userData.firstName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {userData.firstName} {userData.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {userData.role}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/profile")}
          className="text-muted-foreground hover:text-primary"
        >
          <User className="h-5 w-5" />
        </Button>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/api/auth/signout")}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
