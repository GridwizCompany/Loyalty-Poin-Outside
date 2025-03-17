import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="text-lg font-bold">E-Bike Voucher</h1>
      <div>
        <Link href="/admin/dashboard" className="mr-4">
          Dashboard
        </Link>
        <Link href="/mitra/scan">Scan QR</Link>
      </div>
    </nav>
  );
};

export default Navbar;
