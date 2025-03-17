import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { qrCode, action } = req.body;
  const authHeader = req.headers.authorization;

  if (!qrCode) {
    return res.status(400).json({ error: "QR Code is required" });
  }

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  let mitraId;
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "mitra") {
      return res.status(403).json({ error: "Akses hanya untuk mitra" });
    }

    mitraId = decoded.id;
  } catch {
    return res
      .status(401)
      .json({ error: "Token tidak valid atau sudah kedaluwarsa" });
  }

  try {
    const voucher = await prisma.voucher.findUnique({ where: { qrCode } });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher tidak ditemukan" });
    }

    if (!voucher.status) {
      return res.status(400).json({ error: "Voucher sudah digunakan" });
    }

    if (action === "check") {
      return res
        .status(200)
        .json({ message: "Voucher terverifikasi", voucher });
    }

    if (action === "accept") {
      await prisma.voucher.update({
        where: { qrCode },
        data: { status: false, scannedBy: mitraId },
      });

      return res.status(200).json({ message: "Voucher berhasil digunakan" });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("❌ Error scanning voucher:", error);
    return res.status(500).json({ error: "Error processing voucher" });
  }
}
