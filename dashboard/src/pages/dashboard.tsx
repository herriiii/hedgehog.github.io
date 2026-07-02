import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, AlertTriangle, Clock, Trash2, Ban, ChevronRight, LogOut, Home, FileText, Settings, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "") + "/api";

function api(path: string, opts?: RequestInit) {
  return fetch(`${API}${path}`, { credentials: "include", ...opts });
}

type User = { id: string; username: string; avatar: string; guilds: Guild[] };
type Guild = { id: string; name: string; icon: string | null; permissions: string };
type Member = { user: { id: string; username: string; avatar: string | null }; nick: string | null; roles: string[] };
type Log = { action: string; target: string; moderator: string; reason: string; date: string };

const ACTION_COLORS: Record<string, string> = {
  BAN: "text-red-400 bg-red-400/10",
  UNBAN: "text-green-400 bg-green-400/10",
  KICK: "text-orange-400 bg-orange-400/10",
  WARN: "text-yellow-400 bg-yellow-400/10",
};

function getActionColor(action: string) {
  for (const [key, val] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(key)) return val;
  }
  return "text-blue-400 bg-blue-400/10";
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [activePage, setActivePage] = useState<"overview" | "moderation" | "logs" | "bans">("overview");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [minutes, setMinutes] = useState("10");
  const [channelId, setChannelId] = useState("");
  const [purgeAmount, setPurgeAmount] = useState("10");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api("/auth/me").then((r) => { if (!r.ok) throw new Error("unauth"); return r.json(); }),
    retry: false,
  });

  const { data: guildData } = useQuery({
    queryKey: ["guild", selectedGuild?.id],
    queryFn: () => api(`/bot/guilds/${selectedGuild!.id}`).then((r) => r.json()),
    enabled: !!selectedGuild,
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ["members", selectedGuild?.id],
    queryFn: () => api(`/bot/guilds/${selectedGuild!.id}/members`).then((r) => r.json()),
    enabled: !!selectedGuild,
  });

  const { data: logs } = useQuery<Log[]>({
    queryKey: ["logs", selectedGuild?.id],
    queryFn: () => api(`/bot/guilds/${selectedGuild!.id}/logs`).then((r) => r.json()),
    enabled: !!selectedGuild && activePage === "logs",
    refetchInterval: 5000,
  });

  const { data: bans } = useQuery({
    queryKey: ["bans", selectedGuild?.id],
    queryFn: () => api(`/bot/guilds/${selectedGuild!.id}/bans`).then((r) => r.json()),
    enabled: !!selectedGuild && activePage === "bans",
  });

  function modMutation(action: string, body: object) {
    return useMutation({
      mutationFn: () =>
        api(`/bot/guilds/${selectedGuild!.id}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then((r) => r.json()),
      onSuccess: (data) => {
        if (data.error) { toast({ title: "Erreur", description: data.error, variant: "destructive" }); return; }
        toast({ title: "✅ Action effectuée", description: `${action} exécuté avec succès.` });
        qc.invalidateQueries({ queryKey: ["logs", selectedGuild?.id] });
        setTargetId(""); setReason("");
      },
      onError: () => toast({ title: "Erreur", description: "Action échouée.", variant: "destructive" }),
    });
  }

  const banMut = useMutation({
    mutationFn: () => api(`/bot/guilds/${selectedGuild!.id}/ban`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: targetId, reason }) }).then(r => r.json()),
    onSuccess: (d) => { if (d.error) return toast({ title: "Erreur", description: d.error, variant: "destructive" }); toast({ title: "✅ Banni", description: `${targetId} a été banni.` }); qc.invalidateQueries({ queryKey: ["logs"] }); setTargetId(""); setReason(""); },
  });

  const kickMut = useMutation({
    mutationFn: () => api(`/bot/guilds/${selectedGuild!.id}/kick`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: targetId, reason }) }).then(r => r.json()),
    onSuccess: (d) => { if (d.error) return toast({ title: "Erreur", description: d.error, variant: "destructive" }); toast({ title: "✅ Expulsé", description: `${targetId} a été kick.` }); qc.invalidateQueries({ queryKey: ["logs"] }); setTargetId(""); setReason(""); },
  });

  const warnMut = useMutation({
    mutationFn: () => api(`/bot/guilds/${selectedGuild!.id}/warn`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: targetId, reason }) }).then(r => r.json()),
    onSuccess: (d) => { if (d.error) return toast({ title: "Erreur", description: d.error, variant: "destructive" }); toast({ title: "✅ Averti", description: `Warn ajouté à ${targetId}.` }); qc.invalidateQueries({ queryKey: ["logs"] }); setTargetId(""); setReason(""); },
  });

  const timeoutMut = useMutation({
    mutationFn: () => api(`/bot/guilds/${selectedGuild!.id}/timeout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: targetId, minutes: parseInt(minutes), reason }) }).then(r => r.json()),
    onSuccess: (d) => { if (d.error) return toast({ title: "Erreur", description: d.error, variant: "destructive" }); toast({ title: "✅ Timeout", description: `${targetId} timeout ${minutes}min.` }); qc.invalidateQueries({ queryKey: ["logs"] }); setTargetId(""); setReason(""); },
  });

  const purgeMut = useMutation({
    mutationFn: () => api(`/bot/guilds/${selectedGuild!.id}/purge`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channelId, amount: parseInt(purgeAmount) }) }).then(r => r.json()),
    onSuccess: (d) => { if (d.error) return toast({ title: "Erreur", description: d.error, variant: "destructive" }); toast({ title: "✅ Purgé", description: `${d.deleted} messages supprimés.` }); },
  });

  const unbanMut = useMutation({
    mutationFn: (userId: string) => api(`/bot/guilds/${selectedGuild!.id}/ban/${userId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "✅ Débanni" }); qc.invalidateQueries({ queryKey: ["bans"] }); },
  });

  if (userLoading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#8B5523]" />
    </div>
  );

  if (!user) return <LoginPage />;
  if (!selectedGuild) return <GuildSelector user={user} onSelect={setSelectedGuild} />;

  const guild = guildData?.guild;
  const channels = guildData?.channels || [];
  const textChannels = channels.filter((c: any) => c.type === 0);

  const guildIcon = selectedGuild.icon
    ? `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`
    : null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            {guildIcon ? (
              <img src={guildIcon} className="w-9 h-9 rounded-full" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#8B5523] flex items-center justify-center text-sm font-bold">
                {selectedGuild.name[0]}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate">{selectedGuild.name}</p>
              <p className="text-xs text-white/40">{guild?.approximate_member_count ?? "—"} membres</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {[
            { id: "overview", icon: Home, label: "Vue d'ensemble" },
            { id: "moderation", icon: Shield, label: "Modération" },
            { id: "logs", icon: FileText, label: "Logs" },
            { id: "bans", icon: Ban, label: "Bannis" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                activePage === item.id
                  ? "bg-[#8B5523]/20 text-[#c97a3a]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={() => setSelectedGuild(null)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <Settings className="w-4 h-4" />
            Changer de serveur
          </button>
          <button
            onClick={() => api("/auth/logout", { method: "GET" }).then(() => window.location.href = "/")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <img src={user.avatar} className="w-7 h-7 rounded-full" alt="" />
            <span className="text-xs text-white/50 truncate">{user.username}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Overview */}
        {activePage === "overview" && (
          <div className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-2">Vue d'ensemble</h1>
            <p className="text-white/40 text-sm mb-8">Bienvenue dans le dashboard de <span className="text-[#c97a3a]">{selectedGuild.name}</span></p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Membres", value: guild?.approximate_member_count ?? "—", icon: Users, color: "text-blue-400" },
                { label: "En ligne", value: guild?.approximate_presence_count ?? "—", icon: Users, color: "text-green-400" },
                { label: "Salons", value: channels.length, icon: FileText, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#111] border border-white/5 rounded-xl p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#111] border border-white/5 rounded-xl p-5">
              <h2 className="font-semibold mb-4 text-sm text-white/60 uppercase tracking-wider">Accès rapide</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Modérer un membre", page: "moderation", icon: Shield },
                  { label: "Voir les logs", page: "logs", icon: FileText },
                  { label: "Liste des bannis", page: "bans", icon: Ban },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActivePage(item.page as any)}
                    className="flex items-center gap-3 p-3 bg-white/3 hover:bg-[#8B5523]/10 border border-white/5 hover:border-[#8B5523]/30 rounded-lg text-sm transition-all"
                  >
                    <item.icon className="w-4 h-4 text-[#c97a3a]" />
                    {item.label}
                    <ChevronRight className="w-3 h-3 ml-auto text-white/20" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Moderation */}
        {activePage === "moderation" && (
          <div className="p-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-2">Modération</h1>
            <p className="text-white/40 text-sm mb-8">Agis directement sur les membres du serveur.</p>

            <div className="bg-[#111] border border-white/5 rounded-xl p-6 mb-4">
              <h2 className="font-semibold mb-4">Cible & Raison</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">ID de l'utilisateur</label>
                  <Input
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="123456789012345678"
                    className="bg-[#0d0d0d] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Raison</label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Raison de la sanction"
                    className="bg-[#0d0d0d] border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button onClick={() => banMut.mutate()} disabled={!targetId || banMut.isPending} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg">
                  {banMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "🔨 Ban"}
                </Button>
                <Button onClick={() => kickMut.mutate()} disabled={!targetId || kickMut.isPending} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20 rounded-lg">
                  {kickMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "👢 Kick"}
                </Button>
                <Button onClick={() => warnMut.mutate()} disabled={!targetId || warnMut.isPending} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20 rounded-lg">
                  {warnMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "⚠️ Warn"}
                </Button>
                <Button
                  onClick={() => timeoutMut.mutate()}
                  disabled={!targetId || timeoutMut.isPending}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 rounded-lg"
                >
                  {timeoutMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "⏳ Timeout"}
                </Button>
              </div>
              <div className="mt-3">
                <label className="text-xs text-white/40 mb-1 block">Durée timeout (minutes)</label>
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="bg-[#0d0d0d] border-white/10 text-white w-32"
                  min={1}
                />
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Purge de messages</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Salon (ID)</label>
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/10 text-white text-sm rounded-md px-3 py-2"
                  >
                    <option value="">-- Choisir un salon --</option>
                    {textChannels.map((c: any) => (
                      <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Nombre de messages</label>
                  <Input
                    type="number"
                    value={purgeAmount}
                    onChange={(e) => setPurgeAmount(e.target.value)}
                    className="bg-[#0d0d0d] border-white/10 text-white"
                    min={1}
                    max={100}
                  />
                </div>
              </div>
              <Button
                onClick={() => purgeMut.mutate()}
                disabled={!channelId || purgeMut.isPending}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 rounded-lg"
              >
                {purgeMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" />Purger</>}
              </Button>
            </div>
          </div>
        )}

        {/* Logs */}
        {activePage === "logs" && (
          <div className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-2">Logs de modération</h1>
            <p className="text-white/40 text-sm mb-8">Toutes les actions effectuées via le dashboard. Mise à jour toutes les 5s.</p>
            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
              {!logs || logs.length === 0 ? (
                <div className="p-12 text-center text-white/30">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>Aucun log pour l'instant.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-white/30 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Action</th>
                      <th className="px-5 py-3 text-left">Cible</th>
                      <th className="px-5 py-3 text-left">Modérateur</th>
                      <th className="px-5 py-3 text-left">Raison</th>
                      <th className="px-5 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i} className="border-b border-white/3 hover:bg-white/2">
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-white/60 text-xs">{log.target}</td>
                        <td className="px-5 py-3 text-white/70">{log.moderator}</td>
                        <td className="px-5 py-3 text-white/50 truncate max-w-[150px]">{log.reason || "—"}</td>
                        <td className="px-5 py-3 text-white/30 text-xs">{new Date(log.date).toLocaleString("fr-FR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Bans */}
        {activePage === "bans" && (
          <div className="p-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-2">Membres bannis</h1>
            <p className="text-white/40 text-sm mb-8">Liste des membres bannis sur <span className="text-[#c97a3a]">{selectedGuild.name}</span></p>
            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
              {!bans || (Array.isArray(bans) && bans.length === 0) ? (
                <div className="p-12 text-center text-white/30">
                  <Ban className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>Aucun membre banni.</p>
                </div>
              ) : Array.isArray(bans) ? (
                bans.map((ban: any) => (
                  <div key={ban.user.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/2">
                    <img
                      src={ban.user.avatar
                        ? `https://cdn.discordapp.com/avatars/${ban.user.id}/${ban.user.avatar}.png`
                        : `https://cdn.discordapp.com/embed/avatars/0.png`}
                      className="w-9 h-9 rounded-full"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{ban.user.username}</p>
                      <p className="text-xs text-white/30 font-mono">{ban.user.id}</p>
                      {ban.reason && <p className="text-xs text-white/40 mt-0.5">Raison : {ban.reason}</p>}
                    </div>
                    <Button
                      onClick={() => unbanMut.mutate(ban.user.id)}
                      disabled={unbanMut.isPending}
                      size="sm"
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />Débannir
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-white/30 text-sm">{JSON.stringify(bans)}</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LoginPage() {
  const loginUrl = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "") + "/api/auth/login";
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#8B5523] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">🦔</div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Hedgehog Dashboard</h1>
        <p className="text-white/40 text-sm mb-8">Connecte-toi avec Discord pour accéder au dashboard.</p>
        <a
          href={loginUrl}
          className="inline-flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
          Connexion avec Discord
        </a>
      </div>
    </div>
  );
}

function GuildSelector({ user, onSelect }: { user: User; onSelect: (g: Guild) => void }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
          <div>
            <p className="font-bold">{user.username}</p>
            <p className="text-xs text-white/40">Sélectionne un serveur</p>
          </div>
        </div>
        <h1 className="text-2xl font-black uppercase mb-6">Tes serveurs</h1>
        {user.guilds.length === 0 ? (
          <div className="text-center text-white/30 py-12">
            <p>Aucun serveur trouvé où tu as les permissions d'admin.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.guilds.map((guild) => {
              const icon = guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : null;
              return (
                <button
                  key={guild.id}
                  onClick={() => onSelect(guild)}
                  className="flex items-center gap-4 w-full bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-[#8B5523]/40 rounded-xl p-4 transition-all group"
                >
                  {icon ? (
                    <img src={icon} className="w-10 h-10 rounded-full" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#8B5523]/30 flex items-center justify-center font-bold text-[#c97a3a]">
                      {guild.name[0]}
                    </div>
                  )}
                  <span className="font-medium text-sm flex-1 text-left">{guild.name}</span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#c97a3a] transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
