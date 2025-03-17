import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import VoucherTable from "../components/VoucherTable";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Voucher = {
  id: string;
  contact: string;
  contactType: string;
  qrCode: string;
  qrImage: string;
  status: boolean;
  scannedBy?: string | null;
};

type StatistikMitra = {
  mitraId: string;
  restoran: string;
  totalScan: number;
};

export default function Dashboard() {
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("email");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [statistics, setStatistics] = useState<StatistikMitra[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVouchers();
    fetchStatistics();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await axios.get("/api/vouchers");
      setVouchers(res.data);
    } catch {
      toast.error("Gagal mengambil daftar voucher.");
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get("/api/statistics");
      setStatistics(res.data);
    } catch {
      toast.error("Gagal mengambil statistik restoran.");
    }
  };

  const generateVoucher = async () => {
    if (!contact) {
      toast.error("Masukkan email atau nomor HP terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/generate-voucher", {
        contact,
        contactType,
      });

      toast.success("Voucher berhasil dibuat!");
      setVouchers([...vouchers, res.data.voucher]);

      setContact("");
    } catch {
      toast.error("Gagal membuat voucher.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Data untuk Chart.js
  const chartData = {
    labels: statistics.map((stat) => stat.restoran),
    datasets: [
      {
        label: "Jumlah Scan Voucher",
        data: statistics.map((stat) => stat.totalScan),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      {/* 🔹 Form Generate Voucher */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4 bg-gray-100 p-4 rounded-lg shadow">
        <select
          value={contactType}
          onChange={(e) => setContactType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="email">Email</option>
          <option value="phone">Nomor HP</option>
        </select>
        <input
          type={contactType === "email" ? "email" : "tel"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="p-2 border rounded w-64"
          placeholder={`Masukkan ${contactType}`}
        />
        <button
          onClick={generateVoucher}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Generate Voucher"}
        </button>
      </div>

      {/* 🔹 Statistik Mitra */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">📊 Statistik Restoran</h2>

        {statistics.length > 0 ? (
          <>
            <div className="w-full md:w-2/3 mx-auto">
              <Bar data={chartData} />
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-3">No</th>
                    <th className="p-3">Restoran</th>
                    <th className="p-3">Total Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((mitra, index) => (
                    <tr key={mitra.mitraId} className="border-t">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{mitra.restoran}</td>
                      <td className="p-3">{mitra.totalScan} kali</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">
            Belum ada data scan voucher.
          </p>
        )}
      </div>

      {/* 🔹 Tabel Voucher */}
      <h2 className="text-xl font-bold mb-2">🎟️ Daftar Voucher</h2>
      <VoucherTable vouchers={vouchers} />
    </div>
  );
}
