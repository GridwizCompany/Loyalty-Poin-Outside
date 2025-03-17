import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Harap isi email dan password!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth?action=login", {
        email,
        password,
      });

      const { token, role } = res.data;
      toast.success("✅ Login berhasil!");

      localStorage.setItem("token", token);

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "mitra") {
        router.push("/mitra/scan");
      } else {
        toast.error("❗ Role tidak dikenali.");
      }
    } catch (err: unknown) {
      let errMsg = "❌ Login gagal. Periksa email & password.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errMsg = "❌ Email atau password salah!";
        } else if (err.response?.status === 500) {
          errMsg = "⚠️ Server error. Coba lagi nanti.";
        } else {
          errMsg = err.response?.data?.error || errMsg;
        }
      }

      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !role) {
      toast.error("Harap isi semua data!");
      return;
    }

    setLoading(true);
    try {
      const formattedRole = role.toLowerCase();

      await axios.post("/api/auth?action=register", {
        email,
        password,
        role: formattedRole,
      });

      toast.success("✅ Registrasi berhasil! Silakan login.");
      setIsRegistering(false);
    } catch (err: unknown) {
      let errMsg = "❌ Registrasi gagal.";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errMsg = err.response.data.error;
      }

      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold text-center mb-4">
          {isRegistering ? "Registrasi" : "Login"}
        </h2>
        <input
          className="w-full p-2 border rounded mb-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {isRegistering && (
          <select
            className="w-full p-2 border rounded mb-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="admin">Admin</option>
            <option value="mitra">Mitra</option>
          </select>
        )}

        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          className={`w-full p-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : isRegistering ? "Registrasi" : "Login"}
        </button>

        <p className="text-center mt-3 text-sm">
          {isRegistering ? "Sudah punya akun?" : "Belum punya akun?"}
        </p>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full p-2 mt-2 rounded text-white bg-green-600 hover:bg-green-700"
        >
          {isRegistering ? "Login" : "Registrasi"}
        </button>
      </div>
    </div>
  );
}
