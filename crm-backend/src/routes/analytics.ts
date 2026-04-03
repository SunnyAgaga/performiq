import { Router } from "express";
import { Op, fn, col, literal } from "sequelize";
import { Conversation, Agent } from "../models/index.js";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/analytics", requireAuth, async (req: AuthRequest, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const volumeByChannel = await Conversation.findAll({
      where: { createdAt: { [Op.gte]: last30Days } },
      attributes: ["channel", [fn("COUNT", col("id")), "count"]],
      group: ["channel"],
      raw: true,
    }) as unknown as Array<{ channel: string; count: string }>;

    const agentPerformance = await Agent.findAll({
      attributes: ["id", "name", "avatar", "resolvedToday", "rating", "activeConversations"],
      order: [["resolvedToday", "DESC"]],
      limit: 10,
    });

    const dailyVolume: Array<{ date: string; open: number; resolved: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const [openCount, resolvedCount] = await Promise.all([
        Conversation.count({ where: { createdAt: { [Op.between]: [d, next] }, status: { [Op.in]: ["open", "pending"] } } }),
        Conversation.count({ where: { updatedAt: { [Op.between]: [d, next] }, status: "resolved" } }),
      ]);

      dailyVolume.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        open: openCount,
        resolved: resolvedCount,
      });
    }

    res.json({
      volumeByChannel: volumeByChannel.map((r) => ({ channel: r.channel, count: parseInt(r.count) })),
      agentPerformance,
      dailyVolume,
      summary: {
        avgResponseTime: 8.3,
        csatScore: 4.6,
        totalResolved: agentPerformance.reduce((sum, a) => sum + a.resolvedToday, 0),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
