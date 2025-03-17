import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const vouchers = await prisma.voucher.findMany();
      res.status(200).json(vouchers);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      res.status(500).json({ error: "Error fetching vouchers" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
