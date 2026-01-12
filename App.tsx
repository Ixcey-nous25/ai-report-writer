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
    if (!error) setHistory(data || []);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert("Please enter both email and password");
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) alert(error.message); else alert('Sign up successful! You can now log in.');
    setAuthLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert("Please enter both email and password");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 selection:bg-indigo-100">
        <div className="w-full max-w-[440px]">
          <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
            <div className="mb-10 flex flex-col items-center">
              <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200">
                <ShoppingCart className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 mt-2 text-sm">Enter your credentials to access your dashboard</p>
            </div>
            
            <form className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 text-slate-900"
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
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {authLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign in to Dashboard"}
                </button>
                <button 
                  type="button"
                  onClick={handleSignUp}
                  disabled={authLoading}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-4 rounded-2xl transition-all disabled:opacity-50"
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>
          <p className="text-center mt-8 text-slate-400 text-sm">
            Powered by Gemini Pro & Supabase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div key={user?.id || 'guest'} className="min-h-screen bg-slate-50 selection:bg-indigo-100">
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
          <div className="max-w-6xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} /> AI Engine Active
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Description</h2>
              <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">Fill in the details below to generate a high-converting, SEO-optimized product description.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <form onSubmit={handleGenerate} className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. EcoBottl 2.0"
                    value={input.name}
                    onChange={e => setInput({...input, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Key Features</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all min-h-[160px] resize-none placeholder:text-slate-400"
                    placeholder="List your product's best features..."
                    value={input.features}
                    onChange={e => setInput({...input, features: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                      placeholder="e.g. Eco-conscious athletes"
                      value={input.targetAudience}
                      onChange={e => setInput({...input, targetAudience: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tone of Voice</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
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
                  className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-slate-200 mt-4 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="group-hover:text-indigo-400 transition-colors" size={20} />}
                  {loading ? 'Generating...' : 'Generate Copy'}
                </button>
              </form>

              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Output Preview</h3>
                  {lastGenerated && (
                    <button 
                      onClick={() => copyToClipboard(lastGenerated, 'last')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      {copyingId === 'last' ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                      {copyingId === 'last' ? 'Copied to clipboard' : 'Copy result'}
                    </button>
                  )}
                </div>
                
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 min-h-[580px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
                  {!lastGenerated && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                      <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-slate-100">
                        <Zap className="text-slate-300 w-8 h-8" />
                      </div>
                      <h4 className="text-slate-900 font-bold text-lg mb-2">Ready to generate</h4>
                      <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed">Enter your product details and click generate to see the magic happen.</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center">
                      <div className="relative">
                         <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                         <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-slate-900 font-bold mt-6 text-lg">Writing premium copy...</p>
                      <p className="text-slate-500 text-sm">This usually takes about 3-5 seconds</p>
                    </div>
                  )}

                  {lastGenerated && !loading && (
                    <div className="animate-in fade-in duration-1000">
                      <div className="whitespace-pre-wrap text-slate-700 text-lg leading-[1.8] font-medium selection:bg-indigo-100">
                        {lastGenerated}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="max-w-5xl mx-auto space-y-10 py-10 animate-in slide-in-from-bottom-4 duration-700">
            <header>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">History</h2>
              <p className="text-lg text-slate-500 mt-2">Manage and revisit your previously generated assets.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
              {history.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-1 ring-slate-100">
                    <HistoryIcon className="text-slate-300 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No history yet</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your generated descriptions will appear here for easy access later.</p>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 inline-flex items-center gap-2"
                  >
                    Start Creating <ChevronRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] transition-all group flex flex-col h-full">
                      <div className="p-8 border-b border-slate-50 flex items-start justify-between bg-white">
                        <div className="space-y-1">
                          <h3 className="font-bold text-xl text-slate-900 tracking-tight">{item.product_name}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(item.description, item.id)}
                            className={`p-3 rounded-xl transition-all border ${
                              copyingId === item.id 
                              ? 'bg-green-50 border-green-100 text-green-600' 
                              : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100'
                            }`}
                          >
                            {copyingId === item.id ? <CheckCircle size={18} /> : <Copy size={18} />}
                          </button>
                          <button 
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="p-8 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap flex-grow line-clamp-[8]">
                        {item.description}
                      </div>
                      <div className="px-8 pb-8 pt-0">
                         <div className="h-[1px] w-full bg-slate-50 mb-6"></div>
                         <button 
                          onClick={() => copyToClipboard(item.description, item.id)}
                          className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                         >
                           Quick Copy
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Layout>
    </div>  
  );
};

export default App;