import { Router } from "express";
import { db, appraisalsTable, appraisalScoresTable, appraisalReviewersTable, usersTable, cyclesTable, criteriaTable } from "../db/index.js";
import { eq, and, inArray, or } from "drizzle-orm";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.js";

const router = Router();

const formatUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id, name: u.name, email: u.email, role: u.role,
  managerId: u.managerId, department: u.department, jobTitle: u.jobTitle, createdAt: u.createdAt,
});

async function getReviewersForAppraisal(appraisalId: number) {
  const rows = await db.select().from(appraisalReviewersTable).where(eq(appraisalReviewersTable.appraisalId, appraisalId));
  if (rows.length === 0) return [];
  const reviewerUsers = await db.select().from(usersTable).where(inArray(usersTable.id, rows.map(r => r.reviewerId)));
  return reviewerUsers.map(formatUser);
}

async function enrichAppraisal(appraisal: typeof appraisalsTable.$inferSelect) {
  const [employee] = await db.select().from(usersTable).where(eq(usersTable.id, appraisal.employeeId)).limit(1);
  const [cycle] = await db.select().from(cyclesTable).where(eq(cyclesTable.id, appraisal.cycleId)).limit(1);
  const reviewers = await getReviewersForAppraisal(appraisal.id);

  // Keep legacy reviewer field pointing to first reviewer for backward compat
  const reviewer = reviewers.length > 0 ? reviewers[0] : null;

  return {
    ...appraisal,
    employee: formatUser(employee),
    reviewer,
    reviewers,
    cycle,
  };
}

router.get("/appraisals", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { cycleId, employeeId } = req.query;
    const conditions = [];
    if (cycleId) conditions.push(eq(appraisalsTable.cycleId, Number(cycleId)));
    if (employeeId) conditions.push(eq(appraisalsTable.employeeId, Number(employeeId)));

    if (req.user!.role === "employee") {
      conditions.push(eq(appraisalsTable.employeeId, req.user!.id));
    } else if (req.user!.role === "manager") {
      const teamMembers = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.managerId, req.user!.id));
      const memberIds = teamMembers.map(m => m.id);

      // Appraisals where this manager is a reviewer (via junction table)
      const reviewerRows = await db.select({ appraisalId: appraisalReviewersTable.appraisalId })
        .from(appraisalReviewersTable).where(eq(appraisalReviewersTable.reviewerId, req.user!.id));
      const reviewerAppraisalIds = reviewerRows.map(r => r.appraisalId);

      const orConditions = [];
      if (memberIds.length > 0) orConditions.push(inArray(appraisalsTable.employeeId, memberIds));
      if (reviewerAppraisalIds.length > 0) orConditions.push(inArray(appraisalsTable.id, reviewerAppraisalIds));

      if (orConditions.length > 0) conditions.push(or(...orConditions)!);
      else conditions.push(eq(appraisalsTable.employeeId, -1)); // no access
    }

    const appraisals = conditions.length > 0
      ? await db.select().from(appraisalsTable).where(and(...conditions)).orderBy(appraisalsTable.createdAt)
      : await db.select().from(appraisalsTable).orderBy(appraisalsTable.createdAt);

    const enriched = await Promise.all(appraisals.map(enrichAppraisal));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

function nextStatus(current: string, workflowType: string): string | null {
  if (current === "self_review") {
    if (workflowType === "self_only") return "completed";
    return "manager_review";
  }
  if (current === "manager_review") {
    if (workflowType === "admin_approval") return "pending_approval";
    return "completed";
  }
  if (current === "pending_approval") return "completed";
  return null;
}

router.post("/appraisals", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!["admin", "super_admin", "manager"].includes(req.user!.role)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    const { cycleId, employeeId, reviewerIds, workflowType } = req.body;

    // Resolve primary reviewer — first in list or current user
    const resolvedReviewerIds: number[] = Array.isArray(reviewerIds) && reviewerIds.length > 0
      ? reviewerIds.map(Number)
      : (req.user!.role !== "employee" ? [req.user!.id] : []);

    const primaryReviewerId = resolvedReviewerIds[0] ?? null;

    const [appraisal] = await db.insert(appraisalsTable)
      .values({
        cycleId,
        employeeId,
        reviewerId: primaryReviewerId,
        workflowType: workflowType ?? "admin_approval",
        status: "self_review",
      })
      .returning();

    // Insert into junction table
    if (resolvedReviewerIds.length > 0) {
      await db.insert(appraisalReviewersTable).values(
        resolvedReviewerIds.map(rid => ({ appraisalId: appraisal.id, reviewerId: rid }))
      ).onConflictDoNothing();
    }

    const criteria = await db.select().from(criteriaTable);
    if (criteria.length > 0) {
      await db.insert(appraisalScoresTable).values(
        criteria.map(c => ({ appraisalId: appraisal.id, criterionId: c.id }))
      );
    }

    const enriched = await enrichAppraisal(appraisal);
    res.status(201).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/appraisals/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [appraisal] = await db.select().from(appraisalsTable).where(eq(appraisalsTable.id, Number(req.params.id))).limit(1);
    if (!appraisal) { res.status(404).json({ error: "Not found" }); return; }

    const scores = await db.select().from(appraisalScoresTable).where(eq(appraisalScoresTable.appraisalId, appraisal.id));
    const enrichedScores = await Promise.all(scores.map(async s => {
      const [criterion] = await db.select().from(criteriaTable).where(eq(criteriaTable.id, s.criterionId)).limit(1);
      return { ...s, criterion };
    }));

    const enriched = await enrichAppraisal(appraisal);
    res.json({ ...enriched, scores: enrichedScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a reviewer to an existing appraisal
router.post("/appraisals/:id/reviewers", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { reviewerId } = req.body;
    if (!reviewerId) { res.status(400).json({ error: "reviewerId required" }); return; }
    const [appraisal] = await db.select().from(appraisalsTable).where(eq(appraisalsTable.id, Number(req.params.id))).limit(1);
    if (!appraisal) { res.status(404).json({ error: "Not found" }); return; }

    await db.insert(appraisalReviewersTable)
      .values({ appraisalId: appraisal.id, reviewerId: Number(reviewerId) })
      .onConflictDoNothing();

    // Also update primary reviewerId if this is the first reviewer
    if (!appraisal.reviewerId) {
      await db.update(appraisalsTable).set({ reviewerId: Number(reviewerId) }).where(eq(appraisalsTable.id, appraisal.id));
    }

    const reviewers = await getReviewersForAppraisal(appraisal.id);
    res.json({ reviewers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove a reviewer from an existing appraisal
router.delete("/appraisals/:id/reviewers/:reviewerId", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    await db.delete(appraisalReviewersTable)
      .where(and(
        eq(appraisalReviewersTable.appraisalId, Number(req.params.id)),
        eq(appraisalReviewersTable.reviewerId, Number(req.params.reviewerId))
      ));

    // Update primary reviewerId if needed
    const remaining = await getReviewersForAppraisal(Number(req.params.id));
    await db.update(appraisalsTable)
      .set({ reviewerId: remaining.length > 0 ? remaining[0].id : null })
      .where(eq(appraisalsTable.id, Number(req.params.id)));

    res.json({ reviewers: remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/appraisals/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { action, selfComment, managerComment, scores } = req.body;

    const [current] = await db.select().from(appraisalsTable).where(eq(appraisalsTable.id, Number(req.params.id))).limit(1);
    if (!current) { res.status(404).json({ error: "Not found" }); return; }

    // Check if the current user is a reviewer for this appraisal
    const reviewerRow = await db.select().from(appraisalReviewersTable)
      .where(and(eq(appraisalReviewersTable.appraisalId, current.id), eq(appraisalReviewersTable.reviewerId, req.user!.id)))
      .limit(1);
    const isAssignedReviewer = reviewerRow.length > 0;

    const updates: Partial<typeof appraisalsTable.$inferInsert> = {};

    if (action === "submit") {
      const next = nextStatus(current.status, current.workflowType);
      if (next) updates.status = next as any;
    }

    if (selfComment !== undefined) updates.selfComment = selfComment;
    if (managerComment !== undefined) updates.managerComment = managerComment;

    if (scores && Array.isArray(scores)) {
      for (const score of scores) {
        const existing = await db.select().from(appraisalScoresTable)
          .where(and(eq(appraisalScoresTable.appraisalId, Number(req.params.id)), eq(appraisalScoresTable.criterionId, score.criterionId)))
          .limit(1);
        if (existing.length > 0) {
          await db.update(appraisalScoresTable)
            .set({ selfScore: score.selfScore, managerScore: score.managerScore, selfNote: score.selfNote, managerNote: score.managerNote })
            .where(eq(appraisalScoresTable.id, existing[0].id));
        }
      }
      const targetStatus = updates.status ?? current.status;
      if (targetStatus === "pending_approval" || targetStatus === "completed") {
        const allScores = await db.select().from(appraisalScoresTable).where(eq(appraisalScoresTable.appraisalId, Number(req.params.id)));
        const mgScores = allScores.filter(s => s.managerScore != null).map(s => Number(s.managerScore));
        if (mgScores.length > 0) {
          updates.overallScore = String(mgScores.reduce((a, b) => a + b, 0) / mgScores.length);
        }
      }
    }

    if (action === "submit" && current.status === "pending_approval" && !scores) {
      const allScores = await db.select().from(appraisalScoresTable).where(eq(appraisalScoresTable.appraisalId, Number(req.params.id)));
      const mgScores = allScores.filter(s => s.managerScore != null).map(s => Number(s.managerScore));
      if (mgScores.length > 0 && !current.overallScore) {
        updates.overallScore = String(mgScores.reduce((a, b) => a + b, 0) / mgScores.length);
      }
    }

    const [updated] = await db.update(appraisalsTable).set(updates).where(eq(appraisalsTable.id, Number(req.params.id))).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }

    const allScores = await db.select().from(appraisalScoresTable).where(eq(appraisalScoresTable.appraisalId, updated.id));
    const enrichedScores = await Promise.all(allScores.map(async s => {
      const [criterion] = await db.select().from(criteriaTable).where(eq(criteriaTable.id, s.criterionId)).limit(1);
      return { ...s, criterion };
    }));

    const enriched = await enrichAppraisal(updated);
    res.json({ ...enriched, scores: enrichedScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
