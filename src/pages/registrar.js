"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, QrCode, Users, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function RegistrarComponent({ initialPatient }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(initialPatient);

  useEffect(() => {
    if (!session || session.user.role !== "registrar") return;

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");

        const data = await res.json();
        console.log("Fetched patient data:", data);
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, [session]);

  useEffect(() => {
    if (router.query.id && patients.length > 0) {
      const foundPatient = patients.find(
        (p) => p.nationalId === router.query.id
      );
      if (foundPatient) setSelectedPatient(foundPatient);
    }
  }, [router.query.id, patients]);

  const handleSearch = () => {
    const foundPatient = patients.find((p) => p.nationalId === searchId);
    setSelectedPatient(foundPatient || null);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "registrar") {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navbar />
        <div className="flex-1 p-6">
          <p className="text-center text-red-500 mt-10">Unauthorized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Users className="mr-2 h-5 w-5" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patients.length}</div>
              <p className="mt-1 text-sm opacity-80">Registered patients</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & QR Scanner */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">Patient Search</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by National ID..."
                className="pl-8"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                onClick={handleSearch}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/scan-qr-registrar")}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <QrCode className="mr-2 h-4 w-4 text-green-600" />
                Scan QR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details */}
        {selectedPatient ? (
          <div className="grid md:grid-cols-[350px,1fr] gap-6">
            {/* Basic Info */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {selectedPatient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Gender</div>
                  <div>{selectedPatient.gender}</div>
                  <div className="text-gray-500">Blood Type</div>
                  <div>{selectedPatient.bloodType}</div>
                  <div className="text-gray-500">Birth Date</div>
                  <div>{selectedPatient.birthDate}</div>
                  <div className="text-gray-500">Phone</div>
                  <div>{selectedPatient.phone}</div>
                  <div className="text-gray-500">Emergency Contact</div>
                  <div>{selectedPatient.emergencyNumber}</div>
                  <div className="text-gray-500">Address</div>
                  <div>{selectedPatient.address}</div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Info */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient.medicalRecords &&
                selectedPatient.medicalRecords.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="font-medium">
                            Disease Name
                          </TableHead>
                          <TableHead className="font-medium">
                            Description
                          </TableHead>
                          <TableHead className="font-medium">
                            Medication
                          </TableHead>
                          <TableHead className="font-medium">
                            Hospital
                          </TableHead>
                          <TableHead className="font-medium">Doctor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.medicalRecords.map((record, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <TableCell>{record.diseaseName || "N/A"}</TableCell>
                            <TableCell>
                              {record.diseaseDescription || "N/A"}
                            </TableCell>
                            <TableCell>{record.medication || "N/A"}</TableCell>
                            <TableCell>
                              {record.hospitalName || "N/A"}
                            </TableCell>
                            <TableCell>{record.doctorName || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                    <p>No medical records available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-none shadow-md">
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                <p>No patient found.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
