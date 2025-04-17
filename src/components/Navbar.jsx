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
import UserNav from "./UserNav";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const navItems = [
    { icon: Building2, label: "ADMIN", href: "/admin" },
    { icon: Users, label: "PATIENTS", href: "/patients" },
    { icon: UserCog, label: "DOCTORS", href: "/admin-doctor" },
    { icon: UserCog, label: "First Aids", href: "/admin-first-aid" },
    { icon: UserCog, label: "Registrars", href: "/admin-registrar" },
    { icon: Hospital, label: "Hospitals", href: "/admin-hospitals" },
    { icon: MapPin, label: "Cities", href: "/admin-cities" },
    { icon: LayoutDashboard, label: "DASHBOARD", href: "/admin-dashboard" },
  ];

  const doctorNavItems = [
    // Removed Patients and Dashboard items
  ];

  const registrarNavItems = [
    { icon: UserPlus, label: "ADD PATIENT", href: "/registrar-patient-add" },
    { icon: LayoutDashboard, label: "DASHBOARD", href: "/registrar-dashboard" },
  ];

  const getNavItems = () => {
    switch (session?.user?.role) {
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

  return (
    <aside className="w-64 border-r bg-background p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <UserNav user={session?.user} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/profile")}
          className="text-gray-600 hover:text-primary"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-4 flex-grow">
        {getNavItems().map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 text-gray-800"
            >
              <item.icon className="h-4 w-4 text-green-500" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {session?.user?.email || "No email"}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/api/auth/signout")}
            className="text-gray-600 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
