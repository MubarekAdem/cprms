import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const RegistrarPatientAdd = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { name, id, birthDate } = router.query; // Get query parameters

  // Define state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    emergencyNumber: "",
    bloodType: "",
    otherDisease: "",
    password: "",
    repeatPassword: "",
    diseaseName: "",
    diseaseDescription: "",
    medication: "",
    dateAdded: new Date().toISOString().split("T")[0],
    hospitalName: "",
    doctorName: "",
    nationalId: "",
    rawBirthDate: "", // To store the raw birthDate
    rawId: "", // To store the raw ID
    registeredBy: "", // Add registeredBy to the form data
  });

  // Fetch registrar data to populate hospital name and registrar's name
  useEffect(() => {
    if (session && session.user.role === "registrar") {
      const fetchRegistrarData = async () => {
        try {
          const res = await fetch(`/api/registrars`);
          const data = await res.json();

          const registrar = data.find(
            (registrar) => registrar.email === session.user.email
          );

          if (registrar) {
            setFormData((prev) => ({
              ...prev,
              hospitalName: registrar.hospital, // Set hospital name from fetched data
              nationalId: session.user.id, // Assuming national ID is in session
              registeredBy: registrar.name || session.user.name, // Use the name from the registrar data or session
              name: name || prev.name,
              rawBirthDate: birthDate || prev.rawBirthDate, // Store raw birthDate
              rawId: id || prev.rawId, // Store raw ID
            }));
          }
        } catch (error) {
          console.error("Error fetching registrar data:", error);
        }
      };

      fetchRegistrarData();
    }
  }, [session, name, id, birthDate]);

  if (status === "loading")
    return <p className="text-center mt-10">Loading...</p>;
  if (!session || session.user.role !== "registrar") {
    return <p className="text-center text-red-500 mt-10">Unauthorized</p>;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.repeatPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          registeredBy: formData.registeredBy, // Use the name from the form input
          registrarHospital: formData.hospitalName,
          birthDate: formData.rawBirthDate, // Send raw birthDate to the backend
        }),
      });

      if (res.ok) {
        alert("Patient registered successfully!");
        router.push("/registrar-dashboard");
      } else {
        const errorData = await res.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Error registering patient:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Add Patient
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scanned Data (Read-Only) */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              readOnly
              className="w-full p-2 border rounded bg-black"
              placeholder="Name"
            />
          </div>
          <input
            type="text"
            name="id"
            value={formData.rawId} // Display the raw ID
            readOnly
            className="w-full p-2 border rounded bg-black"
            placeholder="National ID"
          />
          <input
            type="text"
            name="birthDate"
            value={formData.rawBirthDate} // Display the raw birthDate
            readOnly
            className="w-full p-2 border rounded bg-black"
            placeholder="Birth Date"
          />

          {/* Additional Patient Info */}
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Phone"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Address"
          />
          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Gender"
          />
          <input
            type="text"
            name="emergencyNumber"
            value={formData.emergencyNumber}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Emergency Number"
          />
          <input
            type="text"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Blood Type"
          />
          <input
            type="text"
            name="otherDisease"
            value={formData.otherDisease}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Other Disease"
          />

          {/* Medical Details */}
          <input
            type="text"
            name="diseaseName"
            value={formData.diseaseName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Disease Name"
          />
          <input
            type="text"
            name="diseaseDescription"
            value={formData.diseaseDescription}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Disease Description"
          />
          <input
            type="text"
            name="medication"
            value={formData.medication}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Medication"
          />
          <input
            type="date"
            name="dateAdded"
            value={formData.dateAdded}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />

          {/* Login Credentials */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Password"
          />
          <input
            type="password"
            name="repeatPassword"
            value={formData.repeatPassword}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Repeat Password"
          />

          {/* Hospital & Doctor Info (Read-Only) */}
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
            placeholder="Hospital Name"
          />
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleInputChange} // Allow the user to type in the field
            className="w-full p-2 border rounded"
            placeholder="Doctor Name"
          />

          {/* Registrar's Name (Editable) */}
          <input
            type="text"
            name="registeredBy"
            value={formData.registeredBy}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Registrar's Name"
          />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded"
              onClick={() => router.push("/scan-qr")}
            >
              Scan QR Code
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarPatientAdd;
