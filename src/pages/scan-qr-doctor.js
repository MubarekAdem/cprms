"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, Camera, Upload, Scan } from "lucide-react";
import { toast } from "sonner";

export default function ScanQRDoctor() {
  const router = useRouter();
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize cameras
  useEffect(() => {
    console.log("Fetching available cameras");
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("Cameras found:", videoDevices);
        if (videoDevices.length > 0) {
          setCameras(videoDevices);
          setSelectedCamera(videoDevices[0].deviceId);
        } else {
          console.warn("No cameras found");
          setErrorMessage(
            "No cameras detected. Ensure your camera software (e.g., Camo) is running."
          );
        }
      })
      .catch((err) => {
        console.error("Error fetching cameras:", err);
        setErrorMessage(
          "Failed to access cameras. Check permissions and camera software."
        );
      });

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        console.log("Stopping camera on unmount");
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (!selectedCamera || selectedCamera === "no-cameras") {
      console.warn("No valid camera selected");
      setErrorMessage("Please select a valid camera.");
      return;
    }

    console.log("Starting camera with ID:", selectedCamera);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedCamera } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Log video resolution and check orientation
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        console.log(
          "Video feed resolution:",
          videoRef.current.videoWidth,
          "x",
          videoRef.current.videoHeight
        );
        console.log("Video settings:", settings);
      }
      streamRef.current = stream;
      console.log("Camera started successfully");
      setIsCameraStarted(true);
      setErrorMessage("");
      setCapturedImage(null);
    } catch (err) {
      console.error("Camera start error:", err);
      setErrorMessage(
        "Failed to start camera. Check permissions or ensure camera software (e.g., Camo) is running."
      );
    }
  };

  const stopCamera = () => {
    if (!isCameraStarted || !streamRef.current) {
      console.warn("Camera not started");
      return;
    }

    console.log("Stopping camera");
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraStarted(false);
    setErrorMessage("");
    setCapturedImage(null);
  };

  const captureAndScan = () => {
    if (!isCameraStarted || !videoRef.current) {
      console.warn("Camera not started");
      setErrorMessage("Camera is not started. Please start the camera first.");
      return;
    }

    console.log("Capturing image from video feed");
    setErrorMessage("");
    setCapturedImage(null);

    try {
      const video = videoRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.warn("Video feed not ready");
        setErrorMessage("Camera feed is not ready. Please wait and try again.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        console.error("Failed to get canvas context");
        setErrorMessage("Failed to process camera image.");
        return;
      }
      context.imageSmoothingEnabled = true;

      // Correct orientation if needed (detected as portrait)
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let dx = 0;
      let dy = 0;
      if (video.videoHeight > video.videoWidth) {
        // Rotate 90 degrees for portrait mode
        canvas.width = video.videoHeight;
        canvas.height = video.videoWidth;
        context.rotate((90 * Math.PI) / 180);
        dx = 0;
        dy = -video.videoHeight;
        drawWidth = video.videoHeight;
        drawHeight = video.videoWidth;
      }
      context.drawImage(video, dx, dy, drawWidth, drawHeight);

      const imageUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageUrl);
      console.log(
        "Captured image dimensions:",
        canvas.width,
        "x",
        canvas.height
      );
      console.log("Captured image (open in browser to inspect):", imageUrl);

      // Image analysis for debugging
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let brightnessSum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        brightnessSum += (r + g + b) / 3;
      }
      const avgBrightness = brightnessSum / (pixels.length / 4);
      console.log("Average image brightness:", avgBrightness);
      if (canvas.width < 1280 || avgBrightness < 50) {
        console.warn(
          "Low resolution or brightness detected. Consider using high-quality camera software like Camo Pro."
        );
        setErrorMessage(
          "Low image quality detected. Use high-resolution camera software (e.g., Camo Pro) and ensure good lighting."
        );
      }

      // Scan with jsQR
      console.log("Scanning with jsQR");
      const code = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        console.log("QR code scan result (jsQR):", code.data);
        processScanResult(code.data);
      } else {
        console.error("No QR code found by jsQR");
        setErrorMessage(
          "No valid QR code detected. Center the QR code within the guide, ensure high-resolution camera software (e.g., Camo Pro), and good lighting/focus."
        );
        toast.error("No QR code detected in captured image");
      }
    } catch (err) {
      console.error("Capture and scan error:", err);
      setErrorMessage("Error capturing or scanning image. Please try again.");
      toast.error("Error capturing image");
    }
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
    setCapturedImage(null);

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
      context.imageSmoothingEnabled = true;
      context.drawImage(img, 0, 0, img.width, img.height);

      const imageUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageUrl);
      console.log(
        "Uploaded image dimensions:",
        canvas.width,
        "x",
        canvas.height
      );
      console.log("Uploaded image (open in browser to inspect):", imageUrl);

      // Image analysis for debugging
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let brightnessSum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        brightnessSum += (r + g + b) / 3;
      }
      const avgBrightness = brightnessSum / (pixels.length / 4);
      console.log("Average image brightness:", avgBrightness);

      // Scan with jsQR
      console.log("Scanning with jsQR");
      const code = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        console.log("QR code scan result (jsQR):", code.data);
        processScanResult(code.data);
      } else {
        console.error("No QR code found by jsQR");
        setErrorMessage("No valid QR code detected in the uploaded image.");
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

    console.log("Stopping camera after successful scan");
    if (isCameraStarted && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraStarted(false);
    }
    setCapturedImage(null);

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <Card className="border-none shadow-md max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row space-x-4">
              <div className="relative w-1/2 aspect-square bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden">
                <p className="absolute -top-6 left-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Center the QR code within the guide
                </p>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {!isCameraStarted ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Camera className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-dashed border-blue-500 rounded-md flex items-center justify-center">
                      <Scan className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                )}
              </div>

              {capturedImage && (
                <div className="w-1/2 space-y-2">
                  <p className="text-sm font-medium">Captured Image Preview:</p>
                  <img
                    src={capturedImage}
                    alt="Captured QR code"
                    className="w-full aspect-square rounded-md border border-gray-200 dark:border-gray-700 object-cover"
                  />
                  <Button
                    variant="outline"
                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = capturedImage;
                      link.download = "captured-qr.jpg";
                      link.click();
                    }}
                  >
                    Download Captured Image
                  </Button>
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
              <Select
                value={selectedCamera || "no-cameras"}
                onValueChange={(value) => {
                  setSelectedCamera(value);
                  if (isCameraStarted && streamRef.current) {
                    console.log("Stopping camera to switch");
                    streamRef.current
                      .getTracks()
                      .forEach((track) => track.stop());
                    setIsCameraStarted(false);
                  }
                }}
                disabled={isCameraStarted}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.length === 0 ? (
                    <SelectItem value="no-cameras" disabled>
                      No cameras available
                    </SelectItem>
                  ) : (
                    cameras.map((camera) => (
                      <SelectItem key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center space-x-4">
              {!isCameraStarted ? (
                <Button
                  onClick={startCamera}
                  disabled={!selectedCamera || selectedCamera === "no-cameras"}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Camera className="mr-2 w-4 h-4" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button
                    onClick={captureAndScan}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <Camera className="mr-2 w-4 h-4" />
                    Capture & Scan
                  </Button>
                  <Button
                    onClick={stopCamera}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Stop Camera
                  </Button>
                </>
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
                  <Input
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
