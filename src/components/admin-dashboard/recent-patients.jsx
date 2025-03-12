"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchDashboardData } from "@/lib/admin-dashboard-data";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await fetchDashboardData("recentPatients");
      setPatients(result);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
        <CardDescription>Latest patient registrations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => (
              <div key={patient.nationalId} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{patient.name}</p>
                    <Badge variant="outline">{patient.bloodType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.medicalRecords.length} medical records
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registered at {patient.registrarHospital}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
