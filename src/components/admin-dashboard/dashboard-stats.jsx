"use client";

import { useState, useEffect } from "react";
import { Building2, UserRound, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    hospitals: 0,
    doctors: 0,
    patients: 0,
    medicalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all data in parallel
        const [hospitalsRes, doctorsRes, patientsRes] = await Promise.all([
          fetch("/api/hospitals"),
          fetch("/api/doctors"),
          fetch("/api/patients"),
        ]);

        if (!hospitalsRes.ok || !doctorsRes.ok || !patientsRes.ok) {
          throw new Error("Failed to fetch statistics data");
        }

        const hospitals = await hospitalsRes.json();
        const doctors = await doctorsRes.json();
        const patients = await patientsRes.json();

        // Count total medical records across all patients
        const medicalRecordsCount = patients.reduce((total, patient) => {
          return total + (patient.medicalRecords?.length || 0);
        }, 0);

        setStats({
          hospitals: hospitals.length,
          doctors: doctors.length,
          patients: patients.length,
          medicalRecords: medicalRecordsCount,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Hospitals",
      value: stats.hospitals,
      icon: Building2,
      change: "",
      trend: "",
    },
    {
      title: "Total Doctors",
      value: stats.doctors,
      icon: UserRound,
      change: "",
      trend: "",
    },
    {
      title: "Total Patients",
      value: stats.patients,
      icon: Users,
      change: "",
      trend: "",
    },
    {
      title: "Medical Records",
      value: stats.medicalRecords,
      icon: FileText,
      change: "",
      trend: "",
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
            ) : error ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  } flex items-center mt-1`}
                >
                  {stat.change}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
