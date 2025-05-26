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
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Loader2,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/admin-dashboard/dashboard-skeleton";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";

// Static JSON data for Ethiopian cities
const ethiopianCities = [
  { city: "Addis Ababa", region: "Addis Ababa (Chartered City)" },
  { city: "Dire Dawa", region: "Dire Dawa (Chartered City)" },
  { city: "Mek'ele", region: "Tigray" },
  { city: "Gondar", region: "Amhara" },
  { city: "Bahir Dar", region: "Amhara" },
  { city: "Adama (Nazret)", region: "Oromia" },
  { city: "Hawassa", region: "Sidama" },
  { city: "Jimma", region: "Oromia" },
  { city: "Jijiga", region: "Somali" },
  { city: "Dessie", region: "Amhara" },
  { city: "Bishoftu (Debre Zeit)", region: "Oromia" },
  { city: "Shashamane", region: "Oromia" },
  {
    city: "Arba Minch",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Harar", region: "Harari" },
  { city: "Asosa", region: "Benishangul-Gumuz" },
  { city: "Gambella", region: "Gambella" },
  { city: "Semera", region: "Afar" },
  { city: "Debre Markos", region: "Amhara" },
  { city: "Debre Berhan", region: "Amhara" },
  { city: "Kombolcha", region: "Amhara" },
  {
    city: "Dilla",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  {
    city: "Hosaena",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Nekemte", region: "Oromia" },
  { city: "Ambo", region: "Oromia" },
  { city: "Woliso", region: "Oromia" },
  { city: "Sebeta", region: "Oromia" },
  { city: "Adigrat", region: "Tigray" },
  { city: "Axum", region: "Tigray" },
  { city: "Shire (Inda Selassie)", region: "Tigray" },
  { city: "Lalibela", region: "Amhara" },
  { city: "Woldia", region: "Amhara" },
  { city: "Bonga", region: "South West Ethiopia Peoples' Region (SWEPR)" },
  {
    city: "Mizan Teferi",
    region: "South West Ethiopia Peoples' Region (SWEPR)",
  },
  {
    city: "Sawla",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Gode", region: "Somali" },
  { city: "Kebri Dahar", region: "Somali" },
  { city: "Asella", region: "Oromia" },
  { city: "Robe", region: "Oromia" },
  { city: "Metu", region: "Oromia" },
  { city: "Yirgalem", region: "Sidama" },
  { city: "Alemaya", region: "Oromia" },
  { city: "Mojo", region: "Oromia" },
  { city: "Ziway", region: "Oromia" },
  {
    city: "Butajira",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  {
    city: "Wolaita Sodo",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Gimbi", region: "Oromia" },
  { city: "Agaro", region: "Oromia" },
  { city: "Chiro (Asebe Teferi)", region: "Oromia" },
  { city: "Finote Selam", region: "Amhara" },
  { city: "Dejen", region: "Amhara" },
  { city: "Mota", region: "Amhara" },
  { city: "Adwa", region: "Tigray" },
  { city: "Humera", region: "Tigray" },
  { city: "Debre Tabor", region: "Amhara" },
  { city: "Burayu", region: "Oromia" },
  { city: "Hagere Hiwot", region: "Amhara" },
  {
    city: "Durame",
    region: "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  },
  { city: "Goba", region: "Oromia" },
  { city: "Meki", region: "Oromia" },
];

export default function CitiesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityForm, setCityForm] = useState({
    name: "",
    code: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showSkeleton = useDelayedLoading(status === "loading" || isLoading);

  // Restrict access
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [session, status, router]);

  // Load cities from JSON
  useEffect(() => {
    setIsLoading(true);
    // Map JSON to match expected structure (name, code, address)
    const formattedCities = ethiopianCities.map((city, index) => ({
      _id: index.toString(), // Generate a unique ID for table keys
      name: city.city,
      code: city.city.slice(0, 3).toUpperCase(), // Generate code from first 3 letters
      address: city.region,
    }));
    setCities(formattedCities);
    setIsLoading(false);
  }, []);

  // Filter cities based on search term
  const filteredCities = cities.filter(
    (city) =>
      city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newCity = {
        _id: (cities.length + 1).toString(),
        name: cityForm.name,
        code: cityForm.code,
        address: cityForm.address,
      };
      setCities((prevCities) => [...prevCities, newCity]);
      setCityForm({ name: "", code: "", address: "" });
      toast.success("City added successfully");
    } catch (error) {
      toast.error("Error adding city: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  if (!session) return null; // Will redirect in useEffect

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-accent text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <MapPin className="mr-2 h-5 w-5" />
                Total Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{cities.length}</div>
              <p className="mt-1 text-sm opacity-80">Registered locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Cities List */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">
              Cities Directory
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cities..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <span>Loading cities...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Code</TableHead>
                      <TableHead className="font-medium">Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <TableRow
                          key={city._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {city.name}
                          </TableCell>
                          <TableCell>{city.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                              <span>{city.address}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          {searchTerm ? (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Search className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No cities found matching {searchTerm} </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                              <p>No cities available.</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add City Form */}
      </div>
    </div>
  );
}
