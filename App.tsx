import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProductInput, GeneratedDescription, View } from './types';
import { generateProductDescription } from './services/geminiService';
import { supabase } from './services/supabase';
import { 
  Sparkles, 
  Copy, 
  CheckCircle, 
  Loader2, 
  PlusCircle, 
  Trash2, 
  ShoppingCart,
  Zap,
  Mail,
  Lock,
  History as HistoryIcon,
  ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  
  const [input, setInput] = useState<ProductInput>({
    name: '',
    features: '',
    targetAudience: '',
    tone: 'Professional'
  });

  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedDescription[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setInput({ name: '', features: '', targetAudience: '', tone: 'Professional' });
        setLastGenerated(null);
        setHistory([]);
        setAuthEmail('');
        setAuthPassword('');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user?.id]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('descriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching history:', error);
    else setHistory(data || []);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) alert(error.message); else alert('Sign up successful!');
    setAuthLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) alert(error.message);
    setAuthLoading(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.name || !input.features) return;
    setLoading(true);
    try {
      const result = await generateProductDescription(input);
      setLastGenerated(result);
      const { error } = await supabase.from('descriptions').insert([{
        product_name: input.name,
        description: result,
        user_id: user.id
      }]);
      if (error) console.error('Error saving to DB:', error);
      fetchHistory();
    } catch (err) {
      alert("Something went wrong with generation.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase.from('descriptions').delete().eq('id', id);
    if (error) alert(error.message); else fetchHistory();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 selection:bg-violet-500/30">
        <div className="relative group w-full max-w-md">
          {/* Ambient Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-zinc-900 border border-white/10 p-10 rounded-3xl shadow-2xl w-full">
            <div className="bg-violet-500/10 border border-violet-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="text-violet-400 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">Vantage AI</h1>
            <p className="text-zinc-500 mb-10 text-center text-sm">Sign in to your dashboard to begin.</p>
            
            <form className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-white/5 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-white outline-none placeholder:text-zinc-700"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-white/5 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-white outline-none placeholder:text-zinc-700"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="button" 
                  onClick={handleSignIn}
                  disabled={authLoading}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.2)] active:scale-95"
                >
                  {authLoading ? <Loader2 className="animate-spin mx-auto" /> : "Sign In"}
                </button>
                <button 
                  type="button"
                  onClick={handleSignUp}
                  disabled={authLoading}
                  className="w-full bg-zinc-800 border border-white/5 hover:bg-zinc-700 text-zinc-300 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={user?.id || 'guest'} className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-violet-500/30">
      <Layout 
       activeView={view} 
       setView={setView} 
       onLogout={async () => {
         await supabase.auth.signOut();
         window.location.reload(); 
       }} 
       userEmail={user.email}
      >
        {view === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
            <header className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></div>
                System Operational
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">New Synthesis</h2>
              <p className="text-zinc-500 text-lg">Input your parameters to generate high-fidelity product copy.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <form onSubmit={handleGenerate} className="lg:col-span-5 bg-zinc-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem] shadow-2xl space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Identity</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-zinc-950 border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all text-white placeholder:text-zinc-700"
                    placeholder="Product name..."
                    value={input.name}
                    onChange={e => setInput({...input, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Specifications</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-zinc-950 border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all min-h-[160px] text-white placeholder:text-zinc-700 resize-none"
                    placeholder="Feature points..."
                    value={input.features}
                    onChange={e => setInput({...input, features: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Audience</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 bg-zinc-950 border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white"
                      placeholder="Demographic..."
                      value={input.targetAudience}
                      onChange={e => setInput({...input, targetAudience: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Vibe</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-zinc-950 border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white appearance-none"
                      value={input.tone}
                      onChange={e => setInput({...input, tone: e.target.value})}
                    >
                      <option>Professional</option>
                      <option>Witty & Fun</option>
                      <option>Urgent / Salesy</option>
                      <option>Minimalist</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 text-white font-bold py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] active:scale-95 disabled:opacity-50 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Processing Data...' : 'Execute Generation'}
                </button>
              </form>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-600">Generated Intelligence</h3>
                  {lastGenerated && (
                    <button 
                      onClick={() => copyToClipboard(lastGenerated, 'last')}
                      className="text-violet-400 hover:text-violet-300 text-xs font-bold flex items-center gap-2 px-3 py-1 bg-violet-500/5 border border-violet-500/10 rounded-full transition-all"
                    >
                      {copyingId === 'last' ? <CheckCircle size={14} /> : <Copy size={14} />}
                      {copyingId === 'last' ? 'Captured' : 'Copy Output'}
                    </button>
                  )}
                </div>
                
                <div className="bg-zinc-950 border border-dashed border-white/5 rounded-[2rem] p-10 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden group">
                  {!lastGenerated && !loading && (
                    <div className="text-center space-y-6 max-w-sm z-10 animate-in zoom-in duration-500">
                      <div className="bg-zinc-900 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto ring-1 ring-white/10 shadow-inner group-hover:ring-violet-500/50 transition-all duration-500">
                        <Zap className="text-zinc-600 group-hover:text-violet-500 transition-colors" size={32} />
                      </div>
                      <p className="text-zinc-600 font-medium italic">Awaiting telemetry. Configure parameters and execute synthesis to generate content.</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="text-center space-y-8 z-10">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 text-violet-500 animate-spin mx-auto opacity-20" />
                        <Sparkles className="absolute inset-0 m-auto text-violet-500 animate-pulse" size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold tracking-widest uppercase text-xs">Processing neural networks</p>
                        <p className="text-zinc-600 text-xs italic">Optimizing for conversions...</p>
                      </div>
                    </div>
                  )}

                  {lastGenerated && !loading && (
                    <div className="w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <div className="bg-zinc-900/40 p-8 rounded-2xl border border-white/5 font-mono text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {lastGenerated}
                      </div>
                    </div>
                  )}

                  {/* Grid background effect */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="max-w-5xl mx-auto space-y-10 py-10 animate-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">Archives</h2>
              <p className="text-zinc-500 text-lg">Revisit and manage your historical generation data.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.length === 0 ? (
                <div className="col-span-full bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-20 text-center space-y-6">
                  <div className="bg-zinc-950 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                    <HistoryIcon className="text-zinc-800 w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Archives are empty</h3>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all"
                  >
                    Start Synthesis <ChevronRight size={18} />
                  </button>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="group bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-300 flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                      <div>
                        <h3 className="font-bold text-white tracking-tight">{item.product_name}</h3>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(item.description, item.id)}
                          className={`p-2.5 rounded-xl transition-all border ${
                            copyingId === item.id 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                            : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {copyingId === item.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-2.5 bg-zinc-800 border border-white/5 text-zinc-500 hover:text-red-400 hover:border-red-400/20 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-8 text-zinc-400 text-sm italic line-clamp-4 leading-relaxed flex-grow">
                      "{item.description}"
                    </div>
                    <div className="px-8 pb-6">
                       <button 
                        onClick={() => copyToClipboard(item.description, item.id)}
                        className="w-full py-3 bg-zinc-950 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-violet-400 group-hover:border-violet-500/30 transition-all"
                       >
                         Restore Output
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Layout>
    </div>  
  );
};

export default App;