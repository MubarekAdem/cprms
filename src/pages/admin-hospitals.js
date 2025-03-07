"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin as CityIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase"; // Import Supabase client for file uploads
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import modal

export default function HospitalsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [editHospital, setEditHospital] = useState(null); // State for editing
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    id: "",
    location: "",
    proofDocument: null,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchCities = async () => {
      const res = await fetch("/api/cities");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCities(data);
      } else {
        console.error("Error: Data is not an array", data);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      const res = await fetch("/api/hospitals");
      const data = await res.json();

      if (Array.isArray(data)) {
        setHospitals(data);
      } else {
        console.error("Error: Data is not an array", data);
      }
    };

    fetchHospitals();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHospitalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Edit Modal
  const openEditModal = (hospital) => {
    setEditHospital(hospital);
    setHospitalForm({ name: hospital.name, location: hospital.location });
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditHospital(null);
    setHospitalForm({ name: "", location: "" });
  };

  // Update Hospital
  const handleUpdateHospital = async () => {
    const res = await fetch(`/api/hospitals/${editHospital.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: hospitalForm.name,
        location: hospitalForm.location,
      }),
    });

    if (res.ok) {
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === editHospital.id ? { ...h, ...hospitalForm } : h
        )
      );
      closeEditModal();
    } else {
      console.error("Error updating hospital");
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (id) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;

    const res = await fetch(`/api/hospitals/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setHospitals((prev) => prev.filter((h) => h.id !== id));
    } else {
      console.error("Error deleting hospital");
    }
  };

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>Access denied</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-[1fr,400px]">
          <div className="space-y-6">
            <Card className="border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Hospitals
                </CardTitle>
                <CityIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {hospitals.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hospitals List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals.length > 0 ? (
                      hospitals.map((hospital, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-blue-800">
                            {hospital.name}
                          </TableCell>
                          <TableCell className="text-blue-600">
                            {hospital.id}
                          </TableCell>
                          <TableCell className="text-blue-600">
                            {hospital.location}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4 text-blue-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditModal(hospital)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteHospital(hospital.id)
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan="4"
                          className="text-center text-gray-600"
                        >
                          No hospitals available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Hospital Modal */}
      {editHospital && (
        <Dialog open={true} onOpenChange={closeEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Hospital</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                name="name"
                value={hospitalForm.name}
                onChange={handleInputChange}
                placeholder="Enter hospital name"
              />
              <Input
                name="location"
                value={hospitalForm.location}
                onChange={handleInputChange}
                placeholder="Enter hospital location"
              />
              <Button className="w-full" onClick={handleUpdateHospital}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
