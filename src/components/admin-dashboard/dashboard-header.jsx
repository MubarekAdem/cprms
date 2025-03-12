"use client";

import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your healthcare network.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full md:w-[200px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col gap-1">
                <p className="font-medium">New patient registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col gap-1">
                <p className="font-medium">Doctor added to Tibebe Ghion</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col gap-1">
                <p className="font-medium">New medical record added</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
