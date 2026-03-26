import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth";

const router = Router();

const formatUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  managerId: u.managerId,
  department: u.department,
  jobTitle: u.jobTitle,
  createdAt: u.createdAt,
});

router.get("/users", requireAuth, requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.name);
    res.json(users.map(formatUser));
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role, managerId, department, jobTitle } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name, email, passwordHash, role, managerId, department, jobTitle,
    }).returning();
    res.status(201).json(formatUser(user));
  } catch (err: any) {
    if (err.code === "23505") res.status(409).json({ error: "Email already exists" });
    else res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/:id", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.params.id))).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, role, managerId, department, jobTitle } = req.body;
    const [user] = await db.update(usersTable)
      .set({ name, email, role, managerId, department, jobTitle })
      .where(eq(usersTable.id, Number(req.params.id)))
      .returning();
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(formatUser(user));
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    if (Number(req.params.id) === req.user!.id) {
      res.status(400).json({ error: "Cannot delete yourself" });
      return;
    }
    await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
