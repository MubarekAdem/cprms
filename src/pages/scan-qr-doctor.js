"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner"; // Correct import
import jsQR from "jsqr"; // For image upload scanning
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Upload, Scan } from "lucide-react";
import { toast } from "sonner";

// Debug imports
console.log("Navbar import:", typeof Navbar);
console.log("Scanner import:", typeof Scanner);
console.log("Button import:", typeof Button);
console.log("Card import:", typeof Card);

export default function ScanQRDoctor() {
  const router = useRouter();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const devices = useDevices(); // Fetch cameras using useDevices hook

  // Initialize cameras
  useEffect(() => {
    console.log("Fetching available cameras");
    if (devices && devices.length) {
      console.log("Cameras found:", devices);
      setCameras(devices);
      setSelectedCamera(devices[0].deviceId);
    } else {
      console.warn("No cameras found");
      setErrorMessage(
        "No cameras detected. Ensure your camera software (e.g., Camo) is running or permissions are granted."
      );
    }
  }, [devices]);

  const handleScan = (result) => {
    if (result && result.length > 0) {
      const decodedText = result[0].rawValue; // Extract QR code value
      console.log("QR code scan result:", decodedText);
      setIsScanning(false);
      processScanResult(decodedText);
    }
  };

  const handleError = (err) => {
    console.warn("QR scan error:", err);
    setErrorMessage(
      "Error scanning QR code. Ensure the QR code is well-lit, centered, and camera permissions are granted."
    );
    toast.error("Failed to scan QR code");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.warn("No file selected");
      setErrorMessage("No file selected.");
      return;
    }

    console.log("Scanning uploaded file:", file.name);
    setErrorMessage("");

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Failed to get canvas context");
        setErrorMessage("Failed to process uploaded image.");
        return;
      }
      context.drawImage(img, 0, 0, img.width, img.height);

      const imageData = context.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);

      if (code) {
        console.log("QR code scan result:", code.data);
        processScanResult(code.data);
      } else {
        console.warn("No QR code detected in uploaded image");
        setErrorMessage("No QR code detected in the uploaded image.");
        toast.error("No QR code detected in uploaded image");
      }
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      console.error("Failed to load uploaded image");
      setErrorMessage("Failed to load uploaded image.");
      toast.error("Failed to load uploaded image");
    };
  };

  const processScanResult = async (result) => {
    const parsedData = parseQRData(result);
    console.log("Parsed QR data:", parsedData);

    console.log("Navigating to /doctor with query:", parsedData);
    router.push(`/doctor?${new URLSearchParams(parsedData).toString()}`);
  };

  const parseQRData = (data) => {
    console.log("Parsing QR data:", data);
    try {
      if (data.startsWith("https://eudigitalidcardprint.com/")) {
        const url = new URL(data);
        const id = url.searchParams.get("id") || "";
        const parsed = { name: "", id, birthDate: "" };
        console.log("Parsed URL data:", parsed);
        return parsed;
      }

      const parts = data.split(":");
      const name = parts[2] || "";
      const idIndex = parts.indexOf("A") + 1;
      const id = idIndex > 0 && idIndex < parts.length ? parts[idIndex] : "";
      const dobIndex = parts.indexOf("D") + 1;
      const dob =
        dobIndex > 0 && dobIndex < parts.length ? parts[dobIndex] : "";
      const parsed = { name, id, birthDate: dob };
      console.log("Parsed data:", parsed);
      return parsed;
    } catch (err) {
      console.error("Error parsing QR data:", err);
      setErrorMessage("Invalid QR code data format.");
      toast.error("Invalid QR code format");
      return { name: "", id: "", birthDate: "" };
    }
  };

  // Fallback if components are undefined
  if (!Navbar || !Card || !Button || !Scanner) {
    console.error("One or more components are undefined:", {
      Navbar: !!Navbar,
      Card: !!Card,
      Button: !!Button,
      Scanner: !!Scanner,
    });
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <div className="text-red-500 font-semibold">
          Error: Missing components. Please check imports and installations.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <Card className="border-none shadow-md max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-1/2 aspect-square bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden mx-auto">
              <p className="absolute -top-6 left-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                Center the QR code within the guide
              </p>
              {isScanning && selectedCamera ? (
                <Scanner
                  constraints={{
                    deviceId: selectedCamera,
                    facingMode: "environment",
                  }}
                  onScan={handleScan}
                  onError={handleError}
                  formats={["qr_code"]}
                  paused={!isScanning}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" },
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-dashed border-blue-500 rounded-md flex items-center justify-center">
                    <Scan className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Camera</label>
              <select
                value={selectedCamera || ""}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isScanning}
              >
                {cameras.length === 0 && (
                  <option value="">No cameras available</option>
                )}
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center space-x-4">
              {!isScanning ? (
                <Button
                  onClick={() => setIsScanning(true)}
                  disabled={!selectedCamera}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Camera className="mr-2 w-4 h-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button
                  onClick={() => setIsScanning(false)}
                  className="bg-red-500 text-white hover:bg-blue-600"
                >
                  Stop Scanning
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                asChild
              >
                <label className="cursor-pointer">
                  <Upload className="mr-2 w-4 h-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
