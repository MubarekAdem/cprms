import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { useRouter } from "next/router";

const ScanQR = () => {
  const router = useRouter();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 400, height: 400 },
      fps: 10,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      const parsedData = parseQRData(result);
      router.push({
        pathname: "/doctor",
        query: parsedData,
      });
    }

    function error(err) {
      console.warn(err);
    }
  }, []);

  const parseQRData = (data) => {
    const parts = data.split(":");

    // Extract name (index 2 in the QR data)
    const name = parts[2] || "";

    // Extract ID (after the "A" tag)
    const idIndex = parts.indexOf("A") + 1;
    const id = idIndex > 0 ? parts[idIndex] : ""; // Ensure correct ID is captured

    // Extract birthdate (after the "D" tag)
    const dobIndex = parts.indexOf("D") + 1;
    const dob = dobIndex > 0 ? parts[dobIndex] : ""; // Return raw birth date

    return { name, id, birthDate: dob }; // Ensure raw birth date is returned
  };

  return <div id="reader"></div>;
};

export default ScanQR;
