import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const action = req.query.action as string;

    if (action === "register") {
      const { email, password, role } = req.body;

      const formattedRole = role.toLowerCase() as Role;

      if (!Object.values(Role).includes(formattedRole)) {
        return res.status(400).json({ error: "Role tidak valid" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, role: formattedRole },
      });

      return res.status(201).json({ message: "Registrasi berhasil", user });
    }

    if (action === "login") {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Harap isi email dan password" });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: "Email tidak ditemukan" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Password salah" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
        expiresIn: "1h",
      });

      return res
        .status(200)
        .json({ message: "Login berhasil", token, role: user.role });
    }

    return res.status(400).json({ error: "Aksi tidak valid" });
  } catch (error: unknown) {
    console.error("❗ Server Error:", error);
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan server, coba lagi nanti." });
  }
}
