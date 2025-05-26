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
  PieChart,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { fetchDashboardData } from "@/lib/admin-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await fetchDashboardData("staffDistribution");
      setData(result);
      setLoading(false);
    }

    loadData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Distribution</CardTitle>
        <CardDescription>Distribution of staff by role</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        ) : (
          <Chart>
            <ChartContainer>
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
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Chart>
        )}
      </CardContent>
    </Card>
  );
}
