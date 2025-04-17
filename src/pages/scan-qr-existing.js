"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

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
          setErrorMessage("No cameras detected on this device.");
        }
      })
      .catch((err) => {
        console.error("Error fetching cameras:", err);
        setErrorMessage("Failed to access cameras. Please check permissions.");
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
      setErrorMessage("Please select a camera.");
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
        "Failed to start camera. Please try another camera or check permissions."
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
        setErrorMessage(
          "Camera feed is not ready. Please wait a moment and try again."
        );
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
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

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

          // Convert Blob to File
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
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                  inversionAttempts: "dontInvert",
                }
              );
              if (code && code.data) {
                console.log("QR code scan result (jsQR):", code.data);
                processScanResult(code.data);
              } else {
                throw new Error("No QR code found by jsQR");
              }
            } catch (jsqrErr) {
              console.error("jsQR scan failed:", jsqrErr);
              setErrorMessage(
                "No valid QR code detected. Ensure the QR code is centered, clear, and compatible with standard QR readers."
              );
            }
          }
        },
        "image/png",
        1.0
      );
    } catch (err) {
      console.error("Capture and scan error:", err);
      setErrorMessage("Error capturing image. Please try again.");
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
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                  inversionAttempts: "dontInvert",
                }
              );
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
      return { name: "", id: "", birthDate: "" };
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
        <div id="reader" className="w-full mb-4" />

        {capturedImage && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Captured Image Preview:</p>
            <img
              src={capturedImage}
              alt="Captured QR code"
              className="w-full rounded border"
            />
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select Camera
          </label>
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

        <div className="flex justify-center space-x-4 mb-4">
          {!isCameraStarted ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!selectedCamera}
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={captureAndScan}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Capture & Scan
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Stop Camera
              </button>
            </>
          )}
        </div>

        <div className="flex justify-center">
          <label className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
