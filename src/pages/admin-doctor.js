"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import {
  UserCircle,
  ImageIcon as BandaidIcon,
  MoreVertical,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DoctorsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded

    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect unauthorized users
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>Access denied</p>;
  }

  const doctors = [
    { name: "DR. Noone", hospital: "Dreamcare hospital" },
    { name: "DR. Someone", hospital: "Dreamcare hospital" },
    { name: "DR. Abebe", hospital: "Dreamcare hospital" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-[1fr,400px]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-green-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">
                    Doctors
                  </CardTitle>
                  <UserCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">1,200</div>
                </CardContent>
              </Card>
              <Card className="border border-green-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">
                    First Aid
                  </CardTitle>
                  <BandaidIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">500</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Doctors List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-green-800">
                          {doctor.name}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {doctor.hospital}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4 text-green-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Add Doctor/First Aid</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="first-aid">First Aid</SelectItem>
                    </SelectContent>
                  </Select>
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
