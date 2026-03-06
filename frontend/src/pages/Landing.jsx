import { Link } from 'react-router-dom';
import { Wallet, Shield, ArrowRight, Zap, MessageCircle, Music, Ghost, Utensils,  Gamepad2, Trash2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <div className="relative pt-6 pb-12 lg:pt-10 lg:pb-20 overflow-hidden">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-float pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

        {/* Navbar */}
        <nav className="relative z-50 flex justify-between items-center px-6 max-w-7xl mx-auto mb-16">
            <div className="text-2xl font-extrabold flex items-center gap-2 tracking-tight hover:scale-105 transition-transform cursor-pointer">
                <span className="text-3xl">🏠</span> RoomieSync
            </div>
            <div className="flex gap-4">
                <Link to="/login" className="hidden sm:block px-5 py-2 rounded-full font-bold text-slate-300 hover:text-white hover:bg-white/10 transition">Log In</Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-white text-slate-900 font-bold hover:bg-blue-50 transition shadow-lg shadow-white/10 hover:shadow-blue-500/20">Get Started</Link>
            </div>
        </nav>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-fade-up hover:scale-105 transition-transform cursor-default">
                <Zap size={14} className="fill-indigo-300" /> The OS for your Bachelor Pad
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Stop Fighting <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">Over The Dishes.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
                We handle the awkward money stuff, the chore wheel, and the quiet hours so you don't have to be the "nagging roommate."
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-20 z-20 relative animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <Link to="/register" className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20 flex items-center justify-center gap-2">
                    Start My House <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="px-8 py-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-white border border-slate-700 font-bold text-lg transition-all hover:scale-105 backdrop-blur-md">
                    I Have a Code
                </Link>
            </div>

            {/* 3D Dashboard Preview */}
            <div className="relative w-full max-w-5xl mx-auto perspective-[2000px] animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-t-3xl shadow-2xl overflow-hidden transform rotate-x-12 opacity-90 hover:opacity-100 hover:rotate-x-0 transition-all duration-700 ease-out group">
                     {/* Fake Browser Header */}
                    <div className="h-10 bg-slate-800/50 border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        <div className="ml-4 px-3 py-1 rounded-md bg-slate-950/50 text-xs text-slate-500 font-mono flex-1 text-center max-w-[200px]">roomiesync.com</div>
                    </div>
                    {/* Fake App Content */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 min-h-[400px] opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 flex flex-col gap-4 hover:bg-slate-800/80 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><Wallet className="text-blue-400" size={24}/></div>
                            <div className="space-y-3">
                                <div className="w-1/2 h-4 rounded bg-slate-700/50"></div>
                                <div className="w-full h-8 rounded bg-slate-700/50"></div>
                                <div className="w-3/4 h-4 rounded bg-slate-700/30"></div>
                            </div>
                        </div>
                        <div className="md:col-span-2 rounded-2xl bg-slate-800/50 border border-white/5 p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2 w-full h-32 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center">
                                <span className="text-slate-600 font-mono text-sm">Activity Graph</span>
                            </div>
                            <div className="h-24 rounded-xl bg-slate-700/30"></div>
                            <div className="h-24 rounded-xl bg-slate-700/30"></div>
                        </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
      </div>

      {/* ================= MARQUEE: AWKWARD TEXTS ================= */}
      <div className="py-12 border-y border-white/5 bg-slate-900/30 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
        
        <div className="flex gap-8 animate-scroll whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-8 items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">🚫 TEXTS YOU WON'T SEND:</span>
                    <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-slate-300 italic flex items-center gap-2">
                        <MessageCircle size={16} /> "Hey, rent was due yesterday..."
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-slate-300 italic flex items-center gap-2">
                        <MessageCircle size={16} /> "Who ate my yogurt??"
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-slate-300 italic flex items-center gap-2">
                        <MessageCircle size={16} /> "Can you keep it down? I have an exam."
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-slate-300 italic flex items-center gap-2">
                        <MessageCircle size={16} /> "Venmo me ₹200 for electricity"
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-slate-300 italic flex items-center gap-2">
                        <MessageCircle size={16} /> "Your dishes are smelling..."
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* ================= ROOMMATE ARCHETYPES (REPLACED TESTIMONIALS) ================= */}
      <div className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Which Roommate Are You?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Every house has them. RoomieSync helps you survive them.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-purple-500/50 transition-all group text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Ghost className="text-purple-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Phantom</h3>
                <p className="text-slate-400 text-sm">Never seen. Pays rent instantly. Might actually be a ghost. We love them.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-orange-500/50 transition-all group text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Utensils className="text-orange-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Masterchef</h3>
                <p className="text-slate-400 text-sm">Cooks amazing food at 2 AM. Uses every single pot and pan. Never cleans.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all group text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gamepad2 className="text-blue-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Screamer</h3>
                <p className="text-slate-400 text-sm">"HE'S ONE HP!!" screams from their room at 3 AM. Needs the Quiet Mode button.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-red-500/50 transition-all group text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 className="text-red-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The 'Later'</h3>
                <p className="text-slate-400 text-sm">"I'll take the trash out later." Narrator: They did not take the trash out later.</p>
            </div>
        </div>
      </div>

      {/* ================= FUNNY STATS (REPLACED FAQ) ================= */}
      <div className="py-20 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-10 text-slate-500 uppercase tracking-widest">Totally Real Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2">1,402</div>
                    <div className="text-slate-400 font-medium">Passive-Aggressive Sticky Notes Saved</div>
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2">₹95k</div>
                    <div className="text-slate-400 font-medium">Pizza Money Tracked</div>
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2">85%</div>
                    <div className="text-slate-400 font-medium">Reduction in "Who ate my yogurt?"</div>
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">404</div>
                    <div className="text-slate-400 font-medium">Friendships Salvaged</div>
                </div>
            </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className="py-24 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to fix your house?</h2>
            <p className="text-xl text-slate-400 mb-10">It's free, easy, and cheaper than therapy.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-slate-950 font-bold text-xl hover:bg-blue-50 transition-transform hover:scale-105 shadow-2xl">
                Get Started Now <ArrowRight size={20} />
            </Link>
        </div>
      </div>

      {/* ================= CLEAN FOOTER ================= */}
      <footer className="py-8 border-t border-white/10 text-center">
        <p className="text-slate-500 text-sm font-medium">© 2026 RoomieSync. Made with 🍕 and ☕ for students.</p>
      </footer>
      
      {/* Inline Styles for the Marquee Animation */}
      <style>{`
        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-scroll {
            animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;