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
  Chart,
  ChartContainer,
  BarChart,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchDashboardData } from "@/lib/admin-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientRecordsChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await fetchDashboardData("patientRecordsByDisease");
      setData(result);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Records by Disease</CardTitle>
        <CardDescription>
          Distribution of medical records by disease type
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : (
          <Chart>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Cases" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        )}
      </CardContent>
    </Card>
  );
}
