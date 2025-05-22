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
import { Label } from "@/components/ui/label";
import { Search, QrCode, Users, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function RegistrarComponent({ initialPatient }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(initialPatient);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

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
        toast.error("Failed to fetch patients. Please try again.");
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
      else toast.error("Patient not found for the provided ID.");
    }
  }, [router.query.id, patients]);

  const handleSearch = () => {
    const foundPatient = patients.find((p) => p.nationalId === searchId);
    setSelectedPatient(foundPatient || null);
    if (!foundPatient) toast.error("No patient found with the provided ID.");
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const validatePassword = () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Both password fields are required");
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("No patient selected for password update");
      return;
    }
    if (!selectedPatient.nationalId) {
      toast.error("Selected patient has no national ID");
      return;
    }
    if (!validatePassword()) return;

    const payload = { password: passwordData.newPassword };
    const requestUrl = `/api/patients/${selectedPatient.nationalId}/password`;
    console.log("Sending password update request:", {
      nationalId: selectedPatient.nationalId,
      requestUrl,
      payload,
    });

    try {
      const res = await fetch(requestUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again.");
    }
  };

  const handlePrintPatientData = () => {
    if (!selectedPatient) {
      toast.error("No patient selected to print");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Medical Report", margin, yPosition);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 40,
      yPosition
    );
    yPosition += 10;

    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      margin,
      yPosition
    );
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, yPosition);
    yPosition += 8;

    const patientData = [
      ["Name", selectedPatient.name || "N/A"],
      ["National ID", selectedPatient.nationalId || "N/A"],
      ["Gender", selectedPatient.gender || "N/A"],
      ["Blood Type", selectedPatient.bloodType || "N/A"],
      ["Birth Date", selectedPatient.birthDate || "N/A"],
      ["Phone", selectedPatient.phone || "N/A"],
      ["Emergency Contact", selectedPatient.emergencyNumber || "N/A"],
      ["Address", selectedPatient.address || "N/A"],
    ];

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    patientData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, margin, yPosition);
      yPosition += 6;
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }
    });

    yPosition += 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Records", margin, yPosition);
    yPosition += 8;

    if (
      selectedPatient.medicalRecords &&
      selectedPatient.medicalRecords.length > 0
    ) {
      const tableColumn = [
        "Disease Name",
        "Description",
        "Medication",
        "Hospital",
        "Doctor",
      ];
      const tableRows = selectedPatient.medicalRecords.map((record) => [
        record.diseaseName || "N/A",
        record.diseaseDescription || "N/A",
        record.medication || "N/A",
        record.hospitalName || "N/A",
        record.doctorName || "N/A",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
        },
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No medical records available.", margin, yPosition);
      yPosition += 10;
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by CPRMS", margin, pageHeight - margin);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 20,
        pageHeight - margin
      );
    }

    doc.save(`patient_report_${selectedPatient.nationalId || "unknown"}.pdf`);
    toast.success("Patient report PDF downloaded successfully.");
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-accent text-white shadow-lg">
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
                className="bg-primary text-white hover:bg-primary/90"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/scan-qr-registrar")}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <QrCode className="mr-2 h-4 w-4 text-primary" />
                Scan QR
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedPatient ? (
          <div className="grid md:grid-cols-[350px,1fr] gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {selectedPatient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Gender</div>
                  <div>{selectedPatient.gender || "N/A"}</div>
                  <div className="text-gray-500">Blood Type</div>
                  <div>{selectedPatient.bloodType || "N/A"}</div>
                  <div className="text-gray-500">Birth Date</div>
                  <div>{selectedPatient.birthDate || "N/A"}</div>
                  <div className="text-gray-500">Phone</div>
                  <div>{selectedPatient.phone || "N/A"}</div>
                  <div className="text-gray-500">Emergency Contact</div>
                  <div>{selectedPatient.emergencyNumber || "N/A"}</div>
                  <div className="text-gray-500">Address</div>
                  <div>{selectedPatient.address || "N/A"}</div>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-500 text-white hover:bg-blue-600"
                    onClick={handlePrintPatientData}
                  >
                    Print Patient Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    disabled={!selectedPatient.nationalId}
                  >
                    {showPasswordForm
                      ? "Cancel Password Update"
                      : "Update Password"}
                  </Button>
                  {showPasswordForm && (
                    <div className="space-y-4 p-4 border rounded-md">
                      <h3 className="text-lg font-semibold">Update Password</h3>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                        />
                      </div>
                      {passwordError && (
                        <p className="text-red-500 text-sm">{passwordError}</p>
                      )}
                      <Button
                        className="w-full bg-blue-500 text-white hover:bg-blue-600"
                        onClick={handlePasswordUpdate}
                        disabled={
                          !passwordData.newPassword ||
                          !passwordData.confirmPassword
                        }
                      >
                        Save New Password
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
