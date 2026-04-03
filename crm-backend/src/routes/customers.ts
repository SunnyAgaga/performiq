import { Router } from "express";
import { Op } from "sequelize";
import { Customer, Conversation } from "../models/index.js";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/customers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { search, channel, page = "1", limit = "20" } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (channel) where.channel = channel;
    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      order: [["lastSeen", "DESC NULLS LAST"], ["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({ total: count, page: parseInt(page), customers: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/customers/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const conversations = await Conversation.findAll({
      where: { customerId: req.params.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
      attributes: ["id", "channel", "status", "createdAt", "lastMessageAt"],
    });

    res.json({ ...customer.toJSON(), conversations });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, channel, tags, notes } = req.body;
    if (!name || !channel) {
      res.status(400).json({ error: "Name and channel are required" });
      return;
    }
    const customer = await Customer.create({ name, email, phone, channel, tags: tags ?? [], notes });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/customers/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    const { name, email, phone, tags, notes } = req.body;
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (tags !== undefined) customer.tags = tags;
    if (notes !== undefined) customer.notes = notes;
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
