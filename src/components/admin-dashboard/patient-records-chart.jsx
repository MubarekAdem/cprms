"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientRecordsChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/patients");
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const patients = await response.json();

        // Extract all medical records
        const allRecords = patients.flatMap(
          (patient) => patient.medicalRecords || []
        );

        // Count occurrences of each disease
        const diseaseCounts = allRecords.reduce((acc, record) => {
          const disease = record.diseaseName;
          if (!acc[disease]) {
            acc[disease] = 0;
          }
          acc[disease]++;
          return acc;
        }, {});

        // Convert to array format needed for the chart
        const chartData = Object.entries(diseaseCounts).map(
          ([name, count]) => ({
            name,
            count,
          })
        );

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
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
          <CardTitle>Patient Records by Disease</CardTitle>
          <CardDescription>
            Distribution of medical records by disease type
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Records by Disease</CardTitle>
          <CardDescription>
            Distribution of medical records by disease type
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

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Records by Disease</CardTitle>
          <CardDescription>
            Distribution of medical records by disease type
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground">
              No patient record data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Records by Disease</CardTitle>
        <CardDescription>
          Distribution of medical records by disease type
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Number of Cases" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
