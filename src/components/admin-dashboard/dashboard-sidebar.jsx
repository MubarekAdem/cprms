"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: Activity, active: true },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Hospitals", href: "/hospitals", icon: Building2 },
    { name: "Doctors", href: "/doctors", icon: UserRound },
    { name: "Cities", href: "/cities", icon: Map },
    { name: "First Aid", href: "/first-aid", icon: FileText },
    { name: "Registrars", href: "/registrars", icon: UserRound },
    { name: "Settings", href: "/settings", icon: Settings },
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
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary">HealthCare</h2>
            <p className="text-muted-foreground text-sm">Analytics Dashboard</p>
          </div>

          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                      item.active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
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
