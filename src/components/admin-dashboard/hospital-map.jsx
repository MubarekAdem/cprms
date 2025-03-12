import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function HospitalChart() {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const chartData = hospitals.map((hospital) => ({
    name: hospital.name,
    location: hospital.location,
    count: 1,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
