"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/patients");
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const data = await response.json();

        // Sort patients by creation date (newest first)
        const sortedPatients = [...data].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Take the 5 most recent patients
        setPatients(sortedPatients.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recent patients:", err);
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
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>Latest patient registrations</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>Latest patient registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-full w-full flex items-center justify-center flex-col">
            <p className="text-red-500">Error loading data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>Latest patient registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground">No patient data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
        <CardDescription>Latest patient registrations</CardDescription>
      </CardHeader>
      <CardContent>
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
                  {patient.medicalRecords?.length || 0} medical records
                </p>
                <p className="text-xs text-muted-foreground">
                  Registered at {patient.registrarHospital}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
