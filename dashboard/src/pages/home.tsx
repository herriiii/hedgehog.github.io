import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Coins, Gamepad2, AlertTriangle, ArrowRight, Lock, Key, Clock, MessageSquareOff, Youtube, Wrench, Search, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <div className="fixed inset-0 bg-noise z-50 pointer-events-none mix-blend-overlay"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-none transform rotate-45 flex items-center justify-center">
              <div className="w-3 h-3 bg-background transform -rotate-45" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight uppercase">HEDGEHOG</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-sm text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors uppercase">Fonctionnalités</a>
            <a href="#logs" className="hover:text-primary transition-colors uppercase">Logs & Sécurité</a>
            <a href="#fun" className="hover:text-primary transition-colors uppercase">Fun & Éco</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="font-mono uppercase tracking-wider text-xs px-4 py-2 border border-primary/40 text-primary hover:bg-primary/10 transition-colors">
              Dashboard
            </a>
            <Button variant="default" className="font-mono uppercase tracking-wider text-xs px-6 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 glitch-hover">
              Inviter le Bot
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
        </div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 w-fit">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-mono text-xs uppercase text-primary">Système Opérationnel.</span>
            </div>
            <h1 className="font-sans text-6xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              L'Admin,<br/>
              <span className="text-stroke transition-all duration-300">Voici Votre</span><br/>
              Nouveau Videur.
            </h1>
            <p className="font-mono text-lg text-muted-foreground max-w-lg leading-relaxed">
              Hedgehog est le bot Discord ultime pour les communautés francophones. Puissant, complet et sans compromis. Intransigeant quand il le faut, amusant quand il le peut.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 font-mono uppercase tracking-widest text-sm glitch-hover">
                Sécuriser le Serveur <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-none h-14 px-8 font-mono uppercase tracking-widest text-sm border-white/20 hover:bg-white/5 hover:text-white">
                Voir les Commandes
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative lg:h-[700px] flex items-center justify-center mt-12 lg:mt-0"
          >
            <div className="absolute inset-0 border border-white/10 rotate-3 scale-95" />
            <div className="absolute inset-0 border border-primary/20 -rotate-3 scale-95" />
            <img 
              src="/hedgehog-mascot.png" 
              alt="Hedgehog Mascot" 
              className="relative z-10 w-full max-w-md object-contain drop-shadow-[0_0_50px_rgba(255,87,34,0.3)] filter contrast-125"
            />
            <div className="absolute bottom-10 right-0 lg:right-10 bg-background/90 backdrop-blur border border-white/10 p-4 font-mono text-xs text-muted-foreground flex flex-col gap-2">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500" /> Ping: 14ms</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary" /> Automod: Actif</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500" /> Sécurité: Max</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Moderation Grid */}
      <section id="features" className="py-32 px-6 relative border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col gap-4">
            <h2 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tight">Tolérance Zéro<br/>Pour les Trolls</h2>
            <p className="font-mono text-muted-foreground max-w-2xl">Un arsenal de modération complet. Automatique ou manuel, aucun comportement toxique ne passe entre les mailles du filet.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-1">
            {[
              { icon: Shield, title: "Ban & Kick", desc: "Éliminez les éléments nuisibles. Système de 3 warns = kick automatique." },
              { icon: Clock, title: "Timeouts", desc: "Mettez les utilisateurs au coin. Durées personnalisées, untimeout facile." },
              { icon: MessageSquareOff, title: "Purge & Slowmode", desc: "Nettoyez le spam instantanément et contrôlez le flux du chat." },
              { icon: Lock, title: "Verrouillage de Salons", desc: "Bloquez un salon en un éclair (lock/unlock) en cas de raid." },
              { icon: AlertTriangle, title: "Automod Anti-Flood", desc: "Détection et timeout automatique si un utilisateur envoie trop de messages." },
              { icon: Key, title: "Menu d'Aide Interactif", desc: "Interface d'aide paginée avec catégories, boutons et menus déroulants." }
            ].map((feature, i) => (
              <div key={i} className="group relative bg-card p-8 border border-white/5 hover:border-primary/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <feature.icon className="w-10 h-10 text-primary mb-6" />
                <h3 className="font-sans text-xl font-bold uppercase tracking-wide mb-3">{feature.title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Showcase */}
      <section id="logs" className="py-32 px-6 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 bg-[#0a0a0c] border border-white/10 font-mono text-sm rounded-none p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <div className="flex gap-2 mb-6 opacity-50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="space-y-4">
              <div><span className="text-primary">@admin</span> <span className="text-white">/warn user:@troll raison:Spam liens</span></div>
              <div className="text-muted-foreground border-l-2 border-primary/50 pl-4 py-2 bg-white/5">
                <span className="text-white font-bold">⚠️ Avertissement</span><br/>
                Utilisateur: @troll<br/>
                Raison: Spam liens<br/>
                <span className="text-primary text-xs mt-2 block">Total warns: 3/3 — Kick automatique en cours...</span>
              </div>
              <div><span className="text-primary">@admin</span> <span className="text-white">/purge amount:50</span></div>
              <div className="text-muted-foreground border-l-2 border-primary/50 pl-4 py-2 bg-white/5">
                <span className="text-green-500 font-bold">✓ Purge effectuée</span><br/>
                50 messages supprimés dans #général
              </div>
              <div className="animate-pulse">_</div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 flex flex-col gap-6">
            <h2 className="font-sans text-5xl md:text-6xl font-black uppercase tracking-tight">Les Logs Ne<br/><span className="text-primary">Mentent Jamais</span></h2>
            <p className="font-mono text-muted-foreground leading-relaxed">
              Toutes les actions de modération sont enregistrées. Des embeds détaillés sont envoyés dans votre salon de logs dédié. Le bot se charge également d'envoyer un message privé (DM) à l'utilisateur sanctionné. Transparence totale, zéro excuse.
            </p>
          </div>
        </div>
      </section>

      {/* Fun & Economy split */}
      <section id="fun" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-card p-12 border border-white/5 relative group overflow-hidden">
            <Gamepad2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="font-sans text-4xl font-black uppercase tracking-tight mb-6">Côté Détente</h3>
            <p className="font-mono text-muted-foreground mb-8">Parce que même les videurs aiment s'amuser. Animez votre communauté avec des mini-jeux.</p>
            <ul className="font-mono text-sm space-y-3">
              {['8ball, Pierre-Feuille-Ciseaux', 'Ship, Roast, Choose', 'Hug, Slap, Mock, Reverse', 'Coinflip, Roll, PP Size'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-card p-12 border border-white/5 relative group overflow-hidden">
            <Coins className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="font-sans text-4xl font-black uppercase tracking-tight mb-6">Économie</h3>
            <p className="font-mono text-muted-foreground mb-8">Un système bancaire complet. Laissez vos utilisateurs s'enrichir et échanger sur votre serveur.</p>
            <ul className="font-mono text-sm space-y-3">
              {['Système de solde bancaire', 'Transferts entre membres', 'Gestion monétaire simple', 'Interface fluide et rapide'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Utilities */}
      <section className="py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <Wrench className="w-16 h-16 mx-auto text-primary mb-8 opacity-80" />
          <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tight mb-16">Outils Essentiels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Search, label: "userinfo & serverinfo" },
              { icon: Volume2, label: "announce & say" },
              { icon: AlertTriangle, label: "poll (Sondages)" },
              { icon: Search, label: "avatar & botinfo" },
              { icon: Wrench, label: "steal emoji" },
              { icon: Youtube, label: "dl vidéo" }
            ].map((util, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all duration-300">
                  <util.icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">{util.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Feature */}
      <section className="py-32 px-6 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Youtube className="w-16 h-16 mx-auto mb-8 text-white" />
          <h2 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">Toujours à l'heure</h2>
          <p className="font-mono text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Hedgehog surveille vos chaînes favorites et poste automatiquement les nouvelles vidéos ou shorts directement sur votre Discord dès leur sortie.
          </p>
          <Button variant="outline" size="lg" className="rounded-none border-white text-white hover:bg-white hover:text-primary font-mono uppercase tracking-widest text-sm h-14 px-8">
            Configurer les Notifs
          </Button>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="py-32 px-6 border-t border-white/10 bg-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-sans text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8">Passez aux<br/>Choses Sérieuses.</h2>
          <p className="font-mono text-muted-foreground text-lg mb-12">
            Mise en place instantanée. Outils surpuissants. Zéro bla-bla.
          </p>
          <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-16 px-12 font-mono uppercase tracking-widest text-lg glitch-hover shadow-[0_0_40px_rgba(255,87,34,0.4)]">
            Inviter sur Discord
          </Button>
        </div>
        
        <div className="mt-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between font-mono text-xs text-muted-foreground border-t border-white/5 pt-8">
          <p>© {new Date().getFullYear()} Hedgehog Bot. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Conditions</a>
            <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-primary transition-colors">Support Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
