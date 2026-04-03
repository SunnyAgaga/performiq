import { Router } from "express";
import bcrypt from "bcryptjs";
import { Agent } from "../models/index.js";
import { requireAuth, requireAdmin, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/agents", requireAuth, async (req: AuthRequest, res) => {
  try {
    const agents = await Agent.findAll({
      attributes: ["id", "name", "email", "role", "avatar", "isActive", "activeConversations", "resolvedToday", "rating", "createdAt"],
      order: [["name", "ASC"]],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/agents", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }
    const existing = await Agent.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const agent = await Agent.create({ name, email: email.toLowerCase(), passwordHash, role: role ?? "agent" });
    const { passwordHash: _, ...safe } = agent.toJSON() as AgentAttributes;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/agents/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const { name, role, isActive } = req.body;
    if (name) agent.name = name;
    if (role) agent.role = role;
    if (isActive !== undefined) agent.isActive = isActive;
    await agent.save();
    const { passwordHash: _, ...safe } = agent.toJSON() as AgentAttributes;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

import type { AgentAttributes } from "../models/Agent.js";
export default router;
