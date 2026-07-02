import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const CLIENT_ID = process.env["DISCORD_CLIENT_ID"]!;
const CLIENT_SECRET = process.env["DISCORD_CLIENT_SECRET"]!;
const REDIRECT_URI = process.env["DISCORD_REDIRECT_URI"] || "http://localhost:80/api/auth/callback";

router.get("/login", (_req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/callback", async (req, res) => {
  const code = req.query["code"] as string;
  if (!code) return res.redirect("/dashboard?error=no_code");

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokens.access_token) {
      logger.error({ tokens }, "OAuth token exchange failed");
      return res.redirect("/dashboard?error=oauth_failed");
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json() as { id: string; username: string; avatar: string | null };

    const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const guilds = await guildsRes.json() as Array<{ id: string; name: string; icon: string | null; permissions: string }>;

    (req as any).session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`,
      guilds: guilds.filter((g) => (parseInt(g.permissions) & 0x20) !== 0 || (parseInt(g.permissions) & 0x8) !== 0),
    };

    res.redirect("/dashboard");
  } catch (err) {
    logger.error({ err }, "OAuth callback error");
    res.redirect("/dashboard?error=server_error");
  }
});

router.get("/logout", (req, res) => {
  (req as any).session.destroy();
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const user = (req as any).session?.user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json(user);
});

export default router;
