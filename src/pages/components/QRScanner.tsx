import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QrScanner: any = dynamic(() => import("react-qr-scanner"), {
  ssr: false,
});

const QRScanner = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
  }, []);

  const handleScan = async (result: { text: string } | null) => {
    if (result) {
      setQrCode(result.text);
      setLoading(true);

      const token = localStorage.getItem("token");

      try {
        const res = await axios.post(
          "/api/scan-voucher",
          { qrCode: result.text, action: "check" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus(res.data.message);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          setStatus(error.response.data?.error || "Terjadi kesalahan");
        } else {
          setStatus("Terjadi kesalahan");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAccept = async () => {
    if (!qrCode) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "/api/scan-voucher",
        { qrCode, action: "accept" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(res.data.message);
      setQrCode(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setStatus(error.response.data?.error || "Terjadi kesalahan");
      } else {
        setStatus("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error("Error QR Scanner:", err);
    setStatus("Gagal mengakses kamera. Pastikan izin kamera diaktifkan.");
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Scan QR Code</h2>

      {isClient ? (
        <>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "100%" }}
            constraints={{ video: { facingMode } }}
          />

          {/* 🔄 Tombol untuk mengganti kamera */}
          <button
            onClick={toggleCamera}
            className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            {facingMode === "environment"
              ? "Gunakan Kamera Depan"
              : "Gunakan Kamera Belakang"}
          </button>
        </>
      ) : (
        <p className="text-center text-red-500">
          Menunggu client-side rendering...
        </p>
      )}

      <div className="mt-4 text-center">
        {loading && <p>Memproses...</p>}

        {status && (
          <p
            className={`text-lg font-bold ${
              status.includes("berhasil") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}

        {status === "Voucher terverifikasi" && (
          <button
            onClick={handleAccept}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Accept
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
