"use client";

import { useState, useEffect } from "react";
import { Building2, UserRound, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardData } from "@/lib/admin-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStats() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await fetchDashboardData("stats");
      setStats(result);
      setLoading(false);
    }

    loadData();
  }, []);

  const statCards = [
    {
      title: "Total Hospitals",
      value: stats.hospitals,
      icon: Building2,
      change: "+2%",
      trend: "up",
    },
    {
      title: "Total Doctors",
      value: stats.doctors,
      icon: UserRound,
      change: "+5%",
      trend: "up",
    },
    {
      title: "Total Patients",
      value: stats.patients,
      icon: Users,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Medical Records",
      value: stats.medicalRecords,
      icon: FileText,
      change: "+8%",
      trend: "up",
    },
  ];

  return (
    <>
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  } flex items-center mt-1`}
                >
                  {stat.change} from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
