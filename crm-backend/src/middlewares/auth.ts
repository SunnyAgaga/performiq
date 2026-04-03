import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Agent } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "crm-secret-fallback";

export interface AuthRequest extends Request {
  agent?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

export function generateToken(agent: { id: number; email: string; role: string; name: string }): string {
  return jwt.sign(agent, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; name: string };
    req.agent = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.agent || req.agent.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
