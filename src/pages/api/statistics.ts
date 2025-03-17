import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const statistics = await prisma.voucher.groupBy({
      by: ["scannedBy"],
      _count: { scannedBy: true },
      orderBy: { _count: { scannedBy: "desc" } },
    });

    const result = await Promise.all(
      statistics.map(async (stat) => {
        if (!stat.scannedBy) {
          return {
            mitraId: "Unknown",
            restoran: "Tidak Diketahui",
            totalScan: stat._count.scannedBy,
          };
        }

        const mitra = await prisma.user.findUnique({
          where: { id: stat.scannedBy as string },
          select: { email: true },
        });

        return {
          mitraId: stat.scannedBy,
          restoran: mitra?.email || "Tidak Diketahui",
          totalScan: stat._count.scannedBy,
        };
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    return res.status(500).json({ error: "Error fetching statistics" });
  }
}
