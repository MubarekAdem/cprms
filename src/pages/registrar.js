"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, QrCode, History, Pill, Search } from "lucide-react";

export default function RegistrarComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== "registrar") return;

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");

        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [session]);

  // Handle loading & unauthorized access
  if (status === "loading")
    return <p className="text-center mt-10">Loading...</p>;
  if (!session || session.user.role !== "registrar") {
    return <p className="text-center text-red-500 mt-10">Unauthorized</p>;
  }

  const firstPatient = patients.length > 0 ? patients[0] : null;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 h-screen text-white p-6">
        <h2 className="text-xl font-bold mb-6">Registrar</h2>
        <ul className="space-y-4">
          <li>
            <Button
              className="w-full bg-gray-700 hover:bg-gray-600"
              onClick={() => router.push("/registrar-dashboard")}
            >
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              className="w-full bg-gray-700 hover:bg-gray-600"
              onClick={() => router.push("/registrar-patient-add")}
            >
              Add Patient
            </Button>
          </li>
          <li>
            <Button
              className="w-full bg-gray-700 hover:bg-gray-600"
              onClick={() => router.push("/registrar-manage-patients")}
            >
              Manage Patients
            </Button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 flex-1 bg-white">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Search patients..." className="pl-8" />
          </div>
          <Button
            variant="outline"
            className="gap-2 border-green-500 text-green-600 hover:bg-green-100"
          >
            <QrCode className="h-4 w-4 text-green-600" />
            Scan QR
          </Button>
        </div>

        {/* Patient Profile (First Patient) */}
        {loading ? (
          <p className="text-center mt-10">Loading patients...</p>
        ) : firstPatient ? (
          <div className="grid md:grid-cols-[350px,1fr] gap-6 mt-6">
            <div className="space-y-6">
              <Card className="border-green-500">
                <CardHeader className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-semibold">
                        {firstPatient.name[0]}
                      </span>
                    </div>
                    <CardTitle className="text-black">
                      {firstPatient.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Gender</div>
                    <div>{firstPatient.gender}</div>
                    <div className="text-gray-500">Blood Type</div>
                    <div>{firstPatient.bloodType}</div>
                    <div className="text-gray-500">Location</div>
                    <div>{firstPatient.address}</div>
                    <div className="text-gray-500">Phone</div>
                    <div>{firstPatient.phone}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient History Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-black">Patient History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-green-100 text-green-700">
                    <TableRow>
                      <TableHead className="w-[400px]">Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Hospital</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        {firstPatient.diseaseDescription}
                      </TableCell>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>{firstPatient.doctorName}</TableCell>
                      <TableCell>{firstPatient.hospitalName}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-center mt-10 text-gray-500">No patients found.</p>
        )}
      </div>
    </div>
  );
}
