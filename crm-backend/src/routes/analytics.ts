import { Router } from "express";
import { Op, fn, col, literal } from "sequelize";
import { Conversation, Agent, Message } from "../models/index.js";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/analytics", requireAuth, async (req: AuthRequest, res) => {
  try {
    const days = parseInt((req.query.days as string) ?? "30");
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // ── Summary counts ────────────────────────────────────────────────────
    const [totalReceived, totalSent, aiMessages] = await Promise.all([
      Message.count({ where: { sender: "customer", createdAt: { [Op.gte]: since } } }),
      Message.count({ where: { sender: { [Op.in]: ["agent", "bot"] }, createdAt: { [Op.gte]: since } } }),
      Message.count({ where: { sender: "bot", createdAt: { [Op.gte]: since } } }),
    ]);

    // ── Top channel by conversation count ─────────────────────────────────
    const channelVolumes = await Conversation.findAll({
      attributes: ["channel", [fn("COUNT", col("id")), "cnt"]],
      group: ["channel"],
      order: [[literal("cnt"), "DESC"]],
      raw: true,
    }) as unknown as Array<{ channel: string; cnt: string }>;

    const topChannelRow = channelVolumes[0] ?? { channel: "whatsapp", cnt: "0" };

    // ── Daily trend (received vs sent) ────────────────────────────────────
    const dailyTrend: Array<{ date: string; received: number; sent: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);

      const [recv, sent] = await Promise.all([
        Message.count({ where: { sender: "customer", createdAt: { [Op.between]: [day, next] } } }),
        Message.count({ where: { sender: { [Op.in]: ["agent", "bot"] }, createdAt: { [Op.between]: [day, next] } } }),
      ]);

      dailyTrend.push({
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        received: recv,
        sent,
      });
    }

    // ── Per-channel stats ─────────────────────────────────────────────────
    const channelNames = ["whatsapp", "facebook", "instagram"] as const;
    const channelStats = await Promise.all(
      channelNames.map(async (channel) => {
        const convIds = (
          await Conversation.findAll({ where: { channel }, attributes: ["id"], raw: true })
        ).map((c: unknown) => (c as { id: number }).id);

        if (convIds.length === 0) {
          return { channel, received: 0, sent: 0, aiMessages: 0 };
        }

        const [received, sent, ai] = await Promise.all([
          Message.count({ where: { conversationId: { [Op.in]: convIds }, sender: "customer", createdAt: { [Op.gte]: since } } }),
          Message.count({ where: { conversationId: { [Op.in]: convIds }, sender: { [Op.in]: ["agent", "bot"] }, createdAt: { [Op.gte]: since } } }),
          Message.count({ where: { conversationId: { [Op.in]: convIds }, sender: "bot", createdAt: { [Op.gte]: since } } }),
        ]);

        return { channel, received, sent, aiMessages: ai };
      })
    );

    // ── Agent performance (kept for backward compat) ──────────────────────
    const agentPerformance = await Agent.findAll({
      attributes: ["id", "name", "avatar", "resolvedToday", "rating", "activeConversations"],
      order: [["resolvedToday", "DESC"]],
      limit: 10,
    });

    res.json({
      summary: {
        totalReceived,
        totalSent,
        aiMessages,
        aiPercentage: totalSent > 0 ? Math.round((aiMessages / totalSent) * 100) : 0,
        topChannel: topChannelRow.channel,
        topChannelCount: parseInt(topChannelRow.cnt),
      },
      dailyTrend,
      channelStats,
      agentPerformance,
      days,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
