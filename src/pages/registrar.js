"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, QrCode } from "lucide-react";

export default function RegistrarComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [searchId, setSearchId] = useState(""); // National ID input
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch all patients
  useEffect(() => {
    if (!session || session.user.role !== "registrar") return;

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");

        const data = await res.json();
        console.log("Fetched patient data:", data); // Log the data to check the structure
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, [session]);

  // If a QR code is scanned, find the patient from the router query
  useEffect(() => {
    if (router.query.id && patients.length > 0) {
      const foundPatient = patients.find(
        (p) => p.nationalId === router.query.id
      );
      if (foundPatient) setSelectedPatient(foundPatient);
    }
  }, [router.query.id, patients]);

  // Search function
  const handleSearch = () => {
    const foundPatient = patients.find((p) => p.nationalId === searchId);
    setSelectedPatient(foundPatient || null);
  };

  if (status === "loading")
    return <p className="text-center mt-10">Loading...</p>;
  if (!session || session.user.role !== "registrar")
    return <p className="text-center text-red-500 mt-10">Unauthorized</p>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 h-screen text-white p-6">
        <h2 className="text-xl font-bold mb-6">Registrar</h2>
        <ul className="space-y-4">
          <li>
            <Button
              className="w-full bg-gray-700"
              onClick={() => router.push("/registrar-dashboard")}
            >
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              className="w-full bg-gray-700"
              onClick={() => router.push("/registrar-patient-add")}
            >
              Add Patient
            </Button>
          </li>
          <li>
            <Button
              className="w-full bg-gray-700"
              onClick={() => router.push("/registrar-manage-patients")}
            >
              Manage Patients
            </Button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 flex-1 bg-white">
        {/* Search & QR Scanner */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by National ID..."
              className="pl-8"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Search
          </Button>
          <Button
            onClick={() => router.push("/scan-qr")}
            className="border-green-500 text-green-600 hover:bg-green-100"
          >
            <QrCode className="h-4 w-4 text-green-600" />
            Scan QR
          </Button>
        </div>

        {/* Patient Details */}
        {selectedPatient ? (
          <div className="grid md:grid-cols-[350px,1fr] gap-6 mt-6">
            {/* Basic Info */}
            <Card className="border-green-500">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-semibold">
                      {selectedPatient.name[0]}
                    </span>
                  </div>
                  <CardTitle className="text-black">
                    {selectedPatient.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-black">
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedPatient.medicalRecords &&
                selectedPatient.medicalRecords.length > 0 ? (
                  selectedPatient.medicalRecords.map((record, index) => (
                    <div key={index} className="space-y-4">
                      {/* Display each medical record inside its own card */}
                      <Card className="border-gray-300">
                        <CardHeader>
                          <CardTitle className="text-black">
                            Record {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-500">Disease Name</div>
                            <div>{record.diseaseName || "N/A"}</div>

                            <div className="text-gray-500">
                              Disease Description
                            </div>
                            <div>{record.diseaseDescription || "N/A"}</div>

                            <div className="text-gray-500">Medication</div>
                            <div>{record.medication || "N/A"}</div>

                            <div className="text-gray-500">Hospital</div>
                            <div>{record.hospitalName || "N/A"}</div>

                            <div className="text-gray-500">Doctor</div>
                            <div>{record.doctorName || "N/A"}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No medical records available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-center mt-10 text-gray-500">No patient found.</p>
        )}
      </div>
    </div>
  );
}
