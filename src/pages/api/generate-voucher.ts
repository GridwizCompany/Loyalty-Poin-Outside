import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { contact, contactType } = req.body;
    if (!contact || !contactType) {
      return res
        .status(400)
        .json({ error: "Contact and Contact Type are required" });
    }

    try {
      const qrData = `voucher:${contact}:${Date.now()}`;
      const qrImage = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "L",
        type: "image/png",
      });

      const voucher = await prisma.voucher.create({
        data: {
          contact,
          contactType,
          qrCode: qrData,
          qrImage,
          status: true,
        },
      });

      res.status(201).json({ message: "Voucher created", qrImage, voucher });
    } catch (error) {
      console.error("Error generating voucher:", error);
      res.status(500).json({ error: "Error generating voucher" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
