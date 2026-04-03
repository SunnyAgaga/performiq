import { Router } from "express";
import bcrypt from "bcryptjs";
import { Agent } from "../models/index.js";
import { requireAuth, generateToken, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const agent = await Agent.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!agent) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!agent.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const valid = await bcrypt.compare(password, agent.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken({ id: agent.id, email: agent.email, role: agent.role, name: agent.name });
    res.json({
      token,
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        avatar: agent.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const agent = await Agent.findByPk(req.agent!.id, {
      attributes: ["id", "name", "email", "role", "avatar", "isActive", "activeConversations", "resolvedToday", "rating"],
    });
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
