import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  UserCog,
  Hospital,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Building2, label: "ADMIN", href: "/admin" },
    { icon: Users, label: "PATIENTS", href: "/patients" },
    { icon: UserCog, label: "DOCTORS", href: "/admin-doctor" },
    { icon: Hospital, label: "Hospitals", href: "/admin-hospitals" },
    { icon: MapPin, label: "Cities", href: "/admin-cities" },
    { icon: LayoutDashboard, label: "DASHBOARD", href: "/dashboard" },
  ];

  return (
    <aside className="w-64 border-r bg-background p-6">
      <div className="space-y-4">
        {navItems.map((item) => (
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
    </aside>
  );
}
