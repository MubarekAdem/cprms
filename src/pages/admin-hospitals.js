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

export default function HospitalsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    id: "",
    location: "",
    proofDocument: null,
  });

  // Check session and role for access control
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect unauthorized users
    }
  }, [session, status, router]);

  // Fetch list of cities
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
      console.log(data); // Check the response data

      if (Array.isArray(data)) {
        setHospitals(data);
      } else {
        console.error("Error: Data is not an array", data);
      }
    };

    fetchHospitals();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHospitalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from("hospital-proof") // Your bucket name
        .upload(`proof-documents/${Date.now()}_${file.name}`, file);

      if (error) {
        console.error("File upload error:", error);
        return;
      }

      // ✅ Store the full URL of the file
      const proofDocumentUrl = `https://your-supabase-url/storage/v1/object/public/hospital-proof/${data.path}`;

      setHospitalForm((prev) => ({
        ...prev,
        proofDocument: proofDocumentUrl, // Store the URL, not just path
      }));
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  // Handle hospital form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/hospitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hospitalForm),
    });
    const data = await res.json();
    if (res.ok) {
      setHospitals((prevHospitals) => [...prevHospitals, data.hospital]);
      setHospitalForm({ name: "", id: "", location: "", proofDocument: null }); // Reset the form
    } else {
      console.error(data.error);
    }
  };

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>Access denied</p>;
  }
  console.log(hospitals); // Add this line to check the hospitals data

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
                    {hospitals && hospitals.length > 0 ? (
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
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Remove
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

          <Card>
            <CardHeader>
              <CardTitle>Add Hospital</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital Name</label>
                  <Input
                    name="name"
                    value={hospitalForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter hospital name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital ID</label>
                  <Input
                    name="id"
                    value={hospitalForm.id}
                    onChange={handleInputChange}
                    placeholder="Enter hospital ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select
                    name="location"
                    value={hospitalForm.location}
                    onValueChange={(value) =>
                      setHospitalForm({ ...hospitalForm, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proof Document</label>
                  <input type="file" onChange={handleFileUpload} />
                </div>
                <Button className="w-full">Submit</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
