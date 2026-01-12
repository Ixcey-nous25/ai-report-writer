
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
  // Alias History to avoid conflict with the global History interface
  History as HistoryIcon
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

  // 1. Pehle ek reset function banayein (App component ke andar)
const resetAppState = () => {
  setInput({
    name: '',
    features: '',
    targetAudience: '',
    tone: 'Professional'
  });
  setLastGenerated(null);
  setHistory([]); // History bhi purani na dikhe
};

// 2. Auth change wale useEffect mein ise call karein
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    if (!session) resetAppState(); // Agar session khatam toh state reset
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
    
    // Jab user Sign Out kare ya naya user Sign In kare, state saaf kar do
    if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      resetAppState();
    }
  });

  return () => subscription.unsubscribe();
}, []);

  // Fetch history when user changes
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
  if (!user) return; // Agar user logged in nahi hai toh return kar jao

  const { data, error } = await supabase
    .from('descriptions')
    .select('*')
    .eq('user_id', user.id) // <--- Ye line sabse zaruri hai!
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching history:', error);
  } else {
    setHistory(data || []);
  }
};

 const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: Agar email/password khali hai toh aage mat badho
    if (!authEmail || !authPassword) {
      alert("Please enter both email and password");
      return;
    }
    
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email: authEmail, 
      password: authPassword 
    });
    
    if (error) {
      alert(error.message);
    } else {
      alert('Sign up successful! You can now log in.');
    }
    setAuthLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      alert("Please enter both email and password");
      return;
    }

    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ 
      email: authEmail, 
      password: authPassword 
    });
    
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
      
      const { error } = await supabase
        .from('descriptions')
        .insert([{
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
    const { error } = await supabase
      .from('descriptions')
      .delete()
      .eq('id', id);
    
    if (error) alert(error.message);
    else fetchHistory();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">AI Copywriter SaaS</h1>
          <p className="text-slate-500 mb-8 text-center">Generate high-converting SEO product descriptions.</p>
          
          <form className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button" 
                onClick={handleSignIn}
                disabled={authLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={handleSignUp}
                disabled={authLoading}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                Sign Up
              </button>
            </div>
          </form>
          <p className="mt-6 text-xs text-center text-slate-400 italic">
            Note: Use your own Supabase project details for real authentication flows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeView={view} 
      setView={setView} 
      onLogout={async () => {
      await supabase.auth.signOut();
    // Ye line browser ko refresh kar degi aur saari state zero ho jayegi
        window.location.href = '/'; 
     }} 
      userEmail={user.email}
    >
      {view === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header>
            <h2 className="text-3xl font-bold text-slate-900">New Description</h2>
            <p className="text-slate-500">Transform your product features into sales copy in seconds.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. EcoBottl 2.0"
                  value={input.name}
                  onChange={e => setInput({...input, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Key Features (One per line)</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px]"
                  placeholder="- BPA Free&#10;- 24hr Temperature retention&#10;- Recycled materials"
                  value={input.features}
                  onChange={e => setInput({...input, features: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Audience</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Athletes"
                    value={input.targetAudience}
                    onChange={e => setInput({...input, targetAudience: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tone</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'Generating...' : 'Generate SEO Copy'}
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Output Preview</h3>
                {lastGenerated && (
                  <button 
                    onClick={() => copyToClipboard(lastGenerated, 'last')}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1"
                  >
                    {copyingId === 'last' ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copyingId === 'last' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center">
                {!lastGenerated && !loading && (
                  <div className="text-center space-y-3 max-w-xs">
                    <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-sm italic">Generated copy will appear here.</p>
                  </div>
                )}
                
                {loading && (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-600 font-medium">Brewing high-converting copy...</p>
                  </div>
                )}

                {lastGenerated && !loading && (
                  <div className="w-full h-full bg-white p-6 rounded-xl border border-slate-200 prose prose-slate">
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
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
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Your History</h2>
              <p className="text-slate-500">Manage and reuse previously generated product copy.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {history.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  {/* Fixed name collision with global History interface */}
                  <HistoryIcon className="text-slate-300 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No history yet</h3>
                <button 
                  onClick={() => setView('dashboard')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                >
                  Create Your First Description
                </button>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{item.product_name}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(item.description, item.id)}
                        className={`p-2 rounded-lg transition-all ${
                          copyingId === item.id 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {copyingId === item.id ? <CheckCircle size={18} /> : <Copy size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 text-slate-600 text-sm line-clamp-3 whitespace-pre-wrap leading-relaxed">
                    {item.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
