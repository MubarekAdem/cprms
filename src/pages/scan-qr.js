"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanQR() {
  const router = useRouter();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 300, height: 300 },
      fps: 10,
    });

    scanner.render(handleSuccess, handleError);

    function handleSuccess(result) {
      scanner.clear();
      const parsedData = parseQRData(result);
      router.push({
        pathname: "/registrar-patient-add",
        query: parsedData,
      });
    }

    function handleError(err) {
      console.warn("QR Scan Error:", err);
    }

    return () => {
      scanner.clear().catch((e) => console.warn("Scanner clear error:", e));
    };
  }, [router]);

  const parseQRData = (data) => {
    const parts = data.split(":");
    const name = parts[2] || "";
    const idIndex = parts.indexOf("A") + 1;
    const id = idIndex > 0 ? parts[idIndex] : "";
    const dobIndex = parts.indexOf("D") + 1;
    const dob = dobIndex > 0 ? parts[dobIndex] : "";
    return { name, id, birthDate: dob };
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
        <div id="reader" className="w-full" />
      </div>
    </div>
  );
}
