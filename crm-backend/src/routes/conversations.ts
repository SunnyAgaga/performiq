import { Router } from "express";
import { Op } from "sequelize";
import { Conversation, Customer, Agent, Message } from "../models/index.js";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status, channel, search, page = "1", limit = "30" } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (channel) where.channel = channel;

    const customerWhere: Record<string, unknown> = {};
    if (search) {
      customerWhere.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Conversation.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: "customer",
          where: Object.keys(customerWhere).length ? customerWhere : undefined,
          attributes: ["id", "name", "phone", "channel"],
        },
        {
          model: Agent,
          as: "assignedAgent",
          attributes: ["id", "name", "avatar"],
          required: false,
        },
      ],
      order: [["lastMessageAt", "DESC"], ["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({ total: count, page: parseInt(page), conversations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Agent, as: "assignedAgent", attributes: ["id", "name", "avatar", "email"], required: false },
        {
          model: Message,
          as: "messages",
          order: [["createdAt", "ASC"]],
          limit: 100,
        },
      ],
    });
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const { status, assignedAgentId } = req.body;
    if (status) conversation.status = status;
    if (assignedAgentId !== undefined) conversation.assignedAgentId = assignedAgentId;
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const messages = await Message.findAll({
      where: { conversationId: req.params.id },
      order: [["createdAt", "ASC"]],
    });

    await Message.update({ isRead: true }, { where: { conversationId: req.params.id, sender: "customer", isRead: false } });
    await Conversation.update({ unreadCount: 0 }, { where: { id: req.params.id } });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content, sender = "agent" } = req.body;
    if (!content) {
      res.status(400).json({ error: "Message content is required" });
      return;
    }

    const message = await Message.create({
      conversationId: parseInt(req.params.id),
      sender,
      content,
      isRead: sender === "agent",
    });

    await Conversation.update(
      { lastMessageAt: new Date(), status: sender === "agent" ? "pending" : "open" },
      { where: { id: req.params.id } }
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
