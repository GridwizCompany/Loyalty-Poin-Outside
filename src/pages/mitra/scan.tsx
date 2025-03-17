import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("../components/QRScanner"), {
  ssr: false,
});

export default function ScanPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      <QRScanner />
    </div>
  );
}
