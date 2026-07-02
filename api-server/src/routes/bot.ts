import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const BOT_TOKEN = process.env["DISCORD_BOT_TOKEN"]!;
const BASE = "https://discord.com/api/v10";

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

async function discordAPI(path: string, method = "GET", body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  return res.json();
}

// In-memory warn store (replace with DB later)
const warns: Record<string, Array<{ userId: string; reason: string; moderator: string; date: string }>> = {};
const modLogs: Array<{ guildId: string; action: string; target: string; moderator: string; reason: string; date: string }> = [];

// GET /api/bot/guilds/:id — guild info
router.get("/guilds/:id", requireAuth, async (req, res) => {
  try {
    const guild = await discordAPI(`/guilds/${req.params.id}?with_counts=true`);
    const channels = await discordAPI(`/guilds/${req.params.id}/channels`);
    const roles = await discordAPI(`/guilds/${req.params.id}/roles`);
    res.json({ guild, channels, roles });
  } catch (err) {
    logger.error({ err }, "Failed to fetch guild");
    res.status(500).json({ error: "Failed to fetch guild" });
  }
});

// GET /api/bot/guilds/:id/members — list members
router.get("/guilds/:id/members", requireAuth, async (req, res) => {
  try {
    const members = await discordAPI(`/guilds/${req.params.id}/members?limit=100`);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// POST /api/bot/guilds/:id/ban
router.post("/guilds/:id/ban", requireAuth, async (req, res) => {
  const { userId, reason } = req.body as { userId: string; reason: string };
  const mod = (req as any).session.user;
  try {
    await discordAPI(`/guilds/${req.params.id}/bans/${userId}`, "PUT", {
      delete_message_seconds: 0,
      reason,
    });
    modLogs.push({ guildId: req.params.id, action: "BAN", target: userId, moderator: mod.username, reason, date: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Ban failed");
    res.status(500).json({ error: "Ban failed" });
  }
});

// DELETE /api/bot/guilds/:id/ban/:userId
router.delete("/guilds/:id/ban/:userId", requireAuth, async (req, res) => {
  const mod = (req as any).session.user;
  try {
    await discordAPI(`/guilds/${req.params.id}/bans/${req.params.userId}`, "DELETE");
    modLogs.push({ guildId: req.params.id, action: "UNBAN", target: req.params.userId, moderator: mod.username, reason: "Via dashboard", date: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Unban failed" });
  }
});

// POST /api/bot/guilds/:id/kick
router.post("/guilds/:id/kick", requireAuth, async (req, res) => {
  const { userId, reason } = req.body as { userId: string; reason: string };
  const mod = (req as any).session.user;
  try {
    await discordAPI(`/guilds/${req.params.id}/members/${userId}`, "DELETE");
    modLogs.push({ guildId: req.params.id, action: "KICK", target: userId, moderator: mod.username, reason, date: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Kick failed" });
  }
});

// POST /api/bot/guilds/:id/warn
router.post("/guilds/:id/warn", requireAuth, async (req, res) => {
  const { userId, reason } = req.body as { userId: string; reason: string };
  const mod = (req as any).session.user;
  const key = `${req.params.id}:${userId}`;
  if (!warns[key]) warns[key] = [];
  warns[key].push({ userId, reason, moderator: mod.username, date: new Date().toISOString() });
  modLogs.push({ guildId: req.params.id, action: "WARN", target: userId, moderator: mod.username, reason, date: new Date().toISOString() });
  res.json({ ok: true, warns: warns[key] });
});

// GET /api/bot/guilds/:id/warns/:userId
router.get("/guilds/:id/warns/:userId", requireAuth, (req, res) => {
  const key = `${req.params.id}:${req.params.userId}`;
  res.json(warns[key] || []);
});

// DELETE /api/bot/guilds/:id/warns/:userId
router.delete("/guilds/:id/warns/:userId", requireAuth, (req, res) => {
  const key = `${req.params.id}:${req.params.userId}`;
  warns[key] = [];
  res.json({ ok: true });
});

// POST /api/bot/guilds/:id/timeout
router.post("/guilds/:id/timeout", requireAuth, async (req, res) => {
  const { userId, minutes, reason } = req.body as { userId: string; minutes: number; reason: string };
  const mod = (req as any).session.user;
  const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  try {
    await discordAPI(`/guilds/${req.params.id}/members/${userId}`, "PATCH", {
      communication_disabled_until: until,
    });
    modLogs.push({ guildId: req.params.id, action: `TIMEOUT ${minutes}min`, target: userId, moderator: mod.username, reason, date: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Timeout failed" });
  }
});

// POST /api/bot/guilds/:id/purge
router.post("/guilds/:id/purge", requireAuth, async (req, res) => {
  const { channelId, amount } = req.body as { channelId: string; amount: number };
  try {
    const msgs = await discordAPI(`/channels/${channelId}/messages?limit=${Math.min(amount, 100)}`);
    const ids = (msgs as Array<{ id: string }>).map((m) => m.id);
    if (ids.length === 1) {
      await discordAPI(`/channels/${channelId}/messages/${ids[0]}`, "DELETE");
    } else if (ids.length > 1) {
      await discordAPI(`/channels/${channelId}/messages/bulk-delete`, "POST", { messages: ids });
    }
    res.json({ ok: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: "Purge failed" });
  }
});

// GET /api/bot/guilds/:id/logs
router.get("/guilds/:id/logs", requireAuth, (req, res) => {
  const logs = modLogs.filter((l) => l.guildId === req.params.id).slice(-50).reverse();
  res.json(logs);
});

// GET /api/bot/guilds/:id/bans
router.get("/guilds/:id/bans", requireAuth, async (req, res) => {
  try {
    const bans = await discordAPI(`/guilds/${req.params.id}/bans`);
    res.json(bans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bans" });
  }
});

export default router;
