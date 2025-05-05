"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Upload, Scan } from "lucide-react";
import { toast } from "sonner";

export default function ScanQRExisting() {
  const router = useRouter();
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    console.log("Initializing Html5Qrcode");
    html5QrCodeRef.current = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log("Cameras found:", devices);
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
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

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        console.log("Stopping camera on unmount");
        html5QrCodeRef.current
          .stop()
          .catch((e) => console.error("Camera stop error:", e));
      }
    };
  }, []);

  const startCamera = async () => {
    if (!selectedCamera) {
      console.warn("No camera selected");
      setErrorMessage("Please select a valid camera.");
      return;
    }

    console.log("Starting camera with ID:", selectedCamera);
    try {
      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          width: 1280,
        },
        () => {},
        (error) => console.warn("QR Scan Error:", error)
      );
      console.log("Camera started successfully");
      setIsCameraStarted(true);
      setErrorMessage("");
      setCapturedImage(null);
    } catch (err) {
      console.error("Camera start error:", err);
      setErrorMessage(
        "Failed to start camera. Check permissions or camera software (e.g., Camo)."
      );
    }
  };

  const stopCamera = async () => {
    if (!isCameraStarted) {
      console.warn("Camera not started");
      return;
    }

    console.log("Stopping camera");
    try {
      await html5QrCodeRef.current.stop();
      console.log("Camera stopped successfully");
      setIsCameraStarted(false);
      setErrorMessage("");
      setCapturedImage(null);
    } catch (err) {
      console.error("Camera stop error:", err);
      setErrorMessage("Failed to stop camera.");
    }
  };

  const captureAndScan = async () => {
    if (!isCameraStarted) {
      console.warn("Camera not started");
      setErrorMessage("Camera is not started. Please start the camera first.");
      return;
    }

    console.log("Capturing image from video feed");
    setErrorMessage("");
    setCapturedImage(null);
    try {
      const videoElement = document.querySelector("#reader video");
      if (!videoElement) {
        console.error("Video element not found");
        setErrorMessage("Camera feed not found. Please restart the camera.");
        return;
      }

      if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
        console.warn("Video feed not ready");
        setErrorMessage("Camera feed is not ready. Please wait and try again.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
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
      if (videoElement.videoHeight > videoElement.videoWidth) {
        canvas.width = videoElement.videoHeight;
        canvas.height = videoElement.videoWidth;
        context.rotate((90 * Math.PI) / 180);
        dx = 0;
        dy = -videoElement.videoHeight;
        drawWidth = videoElement.videoHeight;
        drawHeight = videoElement.videoWidth;
      }
      context.drawImage(videoElement, dx, dy, drawWidth, drawHeight);

      const imageUrl = canvas.toDataURL("image/png", 1.0);
      setCapturedImage(imageUrl);
      console.log("Captured image (open in browser to inspect):", imageUrl);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("Failed to create image blob");
            setErrorMessage("Failed to capture image from camera.");
            return;
          }

          const file = new File([blob], "captured-image.png", {
            type: "image/png",
          });

          console.log("Scanning with html5-qrcode");
          try {
            const result = await html5QrCodeRef.current.scanFile(file, true);
            console.log("QR code scan result (html5-qrcode):", result);
            processScanResult(result);
          } catch (err) {
            console.error("html5-qrcode scan failed:", err);
            console.log("Scanning with jsQR");
            try {
              const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert",
              });
              if (code && code.data) {
                console.log("QR code scan result (jsQR):", code.data);
                processScanResult(code.data);
              } else {
                throw new Error("No QR code found by jsQR");
              }
            } catch (jsqrErr) {
              console.error("jsQR scan failed:", jsqrErr);
              setErrorMessage(
                "No valid QR code detected. Center the QR code within the guide, ensure high-resolution camera software (e.g., Camo), and good lighting/focus."
              );
              toast.error("No QR code detected in captured image");
            }
          }
        },
        "image/png",
        1.0
      );
    } catch (err) {
      console.error("Capture and scan error:", err);
      setErrorMessage("Error capturing image. Please try again.");
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
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0, img.width, img.height);

      canvas.toBlob(
        async (blob) => {
          const fileFromBlob = new File([blob], "uploaded-image.png", {
            type: "image/png",
          });

          try {
            const result = await html5QrCodeRef.current.scanFile(
              fileFromBlob,
              true
            );
            console.log("QR code scan result (html5-qrcode):", result);
            processScanResult(result);
          } catch (err) {
            console.error("html5-qrcode scan failed:", err);
            console.log("Scanning with jsQR");
            try {
              const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert",
              });
              if (code && code.data) {
                console.log("QR code scan result (jsQR):", code.data);
                processScanResult(code.data);
              } else {
                throw new Error("No QR code found by jsQR");
              }
            } catch (jsqrErr) {
              console.error("jsQR scan failed:", jsqrErr);
              setErrorMessage(
                "No valid QR code detected in the uploaded image."
              );
              toast.error("No QR code detected in uploaded image");
            }
          }
        },
        "image/png",
        1.0
      );
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
    if (isCameraStarted) {
      await html5QrCodeRef.current.stop();
      setIsCameraStarted(false);
    }
    setCapturedImage(null);

    console.log(
      "Navigating to /registrar-existing-add with query:",
      parsedData
    );
    router.push(
      `/registrar-existing-add?${new URLSearchParams(parsedData).toString()}`
    );
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
                <div id="reader" className="w-full h-full" />
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
                      link.download = "captured-qr.png";
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
              <select
                value={selectedCamera || ""}
                onChange={(e) => {
                  setSelectedCamera(e.target.value);
                  if (isCameraStarted) {
                    console.log("Stopping camera to switch");
                    html5QrCodeRef.current
                      .stop()
                      .then(() => setIsCameraStarted(false))
                      .catch((e) => console.error("Camera stop error:", e));
                  }
                }}
                className="w-full p-2 border rounded"
                disabled={isCameraStarted}
              >
                {cameras.length === 0 && (
                  <option value="">No cameras available</option>
                )}
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center space-x-4">
              {!isCameraStarted ? (
                <Button
                  onClick={startCamera}
                  disabled={!selectedCamera}
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
