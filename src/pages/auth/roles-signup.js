"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function RolesSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    hospital: "", // This will be populated for registrars
    registrarId: "", // This will be populated for registrars
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (form.role === "registrar") {
      // Fetch the registrars data from the API once 'registrar' role is selected
      const fetchRegistrarData = async () => {
        const res = await fetch("/api/registrars");
        const data = await res.json();

        if (res.ok) {
          // Find the registrar info based on the email (you may change this logic based on how it's stored)
          const registrar = data.find(
            (registrar) => registrar.email === form.email
          );
          if (registrar) {
            setForm((prev) => ({
              ...prev,
              hospital: registrar.hospital, // Assuming the API provides a hospital field
              registrarId: registrar.registrarId, // Assuming the API provides a registrarId
            }));
          } else {
            setError("Registrar not found with this email.");
          }
        } else {
          setError("Failed to fetch registrar data.");
        }
      };

      if (form.email) {
        fetchRegistrarData();
      }
    }
  }, [form.role, form.email]); // Re-run the effect if role or email changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/roles-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold text-center mb-4">Signup</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <Select onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="first-aid">First Aid Responder</SelectItem>
              <SelectItem value="registrar">Registrar</SelectItem>
            </SelectContent>
          </Select>

          {/* Show hospital and registrarId fields when the role is registrar */}
          {form.role === "registrar" && (
            <>
              <Input
                name="hospital"
                placeholder="Hospital Name"
                value={form.hospital}
                onChange={handleChange}
                disabled // Disabled since it's fetched automatically
              />
              <Input
                name="registrarId"
                placeholder="Registrar ID"
                value={form.registrarId}
                onChange={handleChange}
                disabled // Disabled since it's fetched automatically
              />
            </>
          )}

          <Button className="w-full" type="submit">
            Signup
          </Button>
        </form>
      </div>
    </div>
  );
}
