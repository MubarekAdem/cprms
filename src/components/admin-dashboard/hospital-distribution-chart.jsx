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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function HospitalDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/hospitals");
        if (!response.ok) {
          throw new Error("Failed to fetch hospital data");
        }

        const hospitals = await response.json();

        // Group hospitals by location
        const locationCounts = hospitals.reduce((acc, hospital) => {
          const location = hospital.location;
          if (!acc[location]) {
            acc[location] = 0;
          }
          acc[location]++;
          return acc;
        }, {});

        // Convert to array format needed for the chart
        const chartData = Object.entries(locationCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hospital data:", err);
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
          <CardTitle>Hospital Distribution by Location</CardTitle>
          <CardDescription>
            Distribution of hospitals across different cities
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospital Distribution by Location</CardTitle>
          <CardDescription>
            Distribution of hospitals across different cities
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
          <CardTitle>Hospital Distribution by Location</CardTitle>
          <CardDescription>
            Distribution of hospitals across different cities
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
        <CardTitle>Hospital Distribution by Location</CardTitle>
        <CardDescription>
          Distribution of hospitals across different cities
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
