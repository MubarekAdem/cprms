"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Users,
  Building2,
  UserRound,
  Map,
  FileText,
  Settings,
  Menu,
  X,
  UserCog,
  Hospital,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <aside
        className={`w-64 border-r bg-background p-6 fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">HealthCare</h2>
            <p className="text-muted-foreground text-sm">Analytics Dashboard</p>
          </div>

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

          <div className="mt-auto pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">
                  admin@healthcare.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
