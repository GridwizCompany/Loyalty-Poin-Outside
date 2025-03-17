import { FC } from "react";

type Voucher = {
  id: string;
  contact: string;
  contactType: string;
  qrCode: string;
  qrImage: string;
  status: boolean;
  scannedBy?: string | null;
};

type VoucherTableProps = {
  vouchers: Voucher[];
};

const VoucherTable: FC<VoucherTableProps> = ({ vouchers = [] }) => {
  const downloadQR = (qrImage: string, contact: string) => {
    if (!qrImage.startsWith("data:image/png;base64,")) {
      alert("QR Code tidak valid!");
      return;
    }

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `QR_${contact}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <table className="w-full bg-white shadow-md rounded-lg">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">ID</th>
          <th className="p-2">Kontak</th>
          <th className="p-2">Tipe</th>
          <th className="p-2">QR Code</th>
          <th className="p-2">Status</th>
          <th className="p-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {vouchers?.map((voucher) => (
          <tr key={voucher.id} className="border-t">
            <td className="p-2">{voucher.id}</td>
            <td className="p-2">{voucher.contact}</td>
            <td className="p-2">
              {voucher.contactType === "email" ? "Email" : "Nomor HP"}
            </td>
            <td className="p-2">
              {voucher.qrImage?.startsWith("data:image/png;base64,") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={voucher.qrImage}
                  alt="QR Code"
                  className="w-16 h-16 border border-gray-300"
                />
              ) : (
                <span className="text-red-500">QR Code tidak valid</span>
              )}
            </td>

            <td
              className={`p-2 font-bold ${
                voucher.status ? "text-green-600" : "text-red-600"
              }`}
            >
              {voucher.status ? "Belum Digunakan" : "Sudah Digunakan"}
            </td>
            <td className="p-2">
              <button
                onClick={() => downloadQR(voucher.qrImage, voucher.contact)}
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-800"
              >
                Download
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VoucherTable;
