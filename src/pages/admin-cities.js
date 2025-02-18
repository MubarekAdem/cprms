"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
import { MapPin as CityIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CitiesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [cityForm, setCityForm] = useState({ name: "", code: "", address: "" });

  useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded

    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect unauthorized users
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cityForm),
    });
    const data = await res.json();
    if (res.ok) {
      setCities((prevCities) => [...prevCities, data.city]);
      setCityForm({ name: "", code: "", address: "" }); // Reset the form
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

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-[1fr,400px]">
          <div className="space-y-6">
            <Card className="border border-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Cities
                </CardTitle>
                <CityIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {cities.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cities List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities && cities.length > 0 ? (
                      cities.map(
                        (city, i) =>
                          city &&
                          city.name &&
                          city.code &&
                          city.address && (
                            <TableRow key={i}>
                              <TableCell className="font-medium text-blue-800">
                                {city.name}
                              </TableCell>
                              <TableCell className="text-blue-600">
                                {city.code}
                              </TableCell>
                              <TableCell className="text-blue-600">
                                {city.address}
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
                          )
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan="4"
                          className="text-center text-gray-600"
                        >
                          No cities available.
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
              <CardTitle>Add City</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City Name</label>
                  <Input
                    name="name"
                    value={cityForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City Code</label>
                  <Input
                    name="code"
                    value={cityForm.code}
                    onChange={handleInputChange}
                    placeholder="Enter city code"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    name="address"
                    value={cityForm.address}
                    onChange={handleInputChange}
                    placeholder="Enter city address"
                  />
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
