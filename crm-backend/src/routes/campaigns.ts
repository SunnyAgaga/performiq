import { Router } from "express";
import { Campaign } from "../models/index.js";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/campaigns", requireAuth, async (req: AuthRequest, res) => {
  try {
    const campaigns = await Campaign.findAll({ order: [["createdAt", "DESC"]] });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/campaigns", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, channel, message, scheduledAt } = req.body;
    if (!name || !channel || !message) {
      res.status(400).json({ error: "Name, channel, and message are required" });
      return;
    }
    const campaign = await Campaign.create({
      name,
      channel,
      message,
      status: scheduledAt ? "scheduled" : "draft",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/campaigns/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    const { name, message, status, scheduledAt } = req.body;
    if (name) campaign.name = name;
    if (message) campaign.message = message;
    if (status) {
      campaign.status = status;
      if (status === "sent") campaign.sentAt = new Date();
    }
    if (scheduledAt) campaign.scheduledAt = new Date(scheduledAt);
    await campaign.save();
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/campaigns/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    await campaign.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
