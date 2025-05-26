"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HospitalMap() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/hospitals");
        if (!response.ok) {
          throw new Error("Failed to fetch hospital data");
        }

        const data = await response.json();
        setHospitals(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hospital locations:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospital Locations</CardTitle>
          <CardDescription>
            Geographical distribution of hospitals
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospital Locations</CardTitle>
          <CardDescription>
            Geographical distribution of hospitals
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full w-full flex items-center justify-center flex-col">
            <p className="text-red-500">Error loading data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hospitals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospital Locations</CardTitle>
          <CardDescription>
            Geographical distribution of hospitals
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground">No hospital data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Locations</CardTitle>
        <CardDescription>
          Geographical distribution of hospitals
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] relative">
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          {/* This would be replaced with an actual map component */}
          <div className="h-full w-full flex items-center justify-center flex-col">
            <p className="text-muted-foreground text-sm"></p>
            <ul className="mt-4 text-sm">
              {hospitals.map((hospital) => (
                <li key={hospital.id} className="flex items-center gap-2 mb-2">
                  <span className="h-3 w-3 rounded-full bg-primary"></span>
                  <span>
                    {hospital.name} - {hospital.location}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
