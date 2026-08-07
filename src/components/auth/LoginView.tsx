import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // Certifique-se de criar este arquivo de conexão

interface LoginViewProps {
  // Passa os dados obtidos do Supabase após o login bem-sucedido
  onLoginSuccess: (user: any) => void; 
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    // Chamada real de autenticação no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      // Traduz os erros mais comuns retornados pelo Supabase
      if (error.message === 'Invalid login credentials') {
        setErrorMsg('E-mail ou senha incorretos.');
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    // Se o login for bem-sucedido, envia os dados do usuário conectado
    if (data?.user) {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-800 dark:text-slate-100">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-700 text-white font-bold text-2xl shadow-sm mb-2">
            U
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-white">
            UNICCAT INTRANET
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
            Medicina e Segurança do Trabalho
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium flex items-center gap-2">
            <X className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@uniccat.com.br"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={loading}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Lembrar meu acesso</span>
            </label>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            disabled={loading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <span>{loading ? 'Autenticando...' : 'Entrar na Intranet'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

      </div>
    </div>
  );
};
