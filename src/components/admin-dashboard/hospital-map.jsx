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
import { Skeleton } from "@/components/ui/skeleton";

export default function HospitalMap() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await fetchDashboardData("hospitalLocations");
      setHospitals(result);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Locations</CardTitle>
        <CardDescription>
          Geographical distribution of hospitals
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] relative">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
            {/* This would be replaced with an actual map component */}
            <div className="h-full w-full flex items-center justify-center flex-col">
              <p className="text-muted-foreground text-sm">
                Interactive map would be displayed here
              </p>
              <ul className="mt-4 text-sm">
                {hospitals.map((hospital) => (
                  <li
                    key={hospital.id}
                    className="flex items-center gap-2 mb-2"
                  >
                    <span className="h-3 w-3 rounded-full bg-primary"></span>
                    <span>
                      {hospital.name} - {hospital.location}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
