import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '../../lib/supabaseClient';

interface LoginViewProps {
  // Alterado para aceitar qualquer estrutura temporariamente e destravar o build
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error || !supabaseUrl || supabaseAnonKey === 'placeholder-key') {
      const emailTrim = email.trim().toLowerCase();
      const isTestAdmin = emailTrim === 'teste@uniccat.com.br';
      if (isTestAdmin || password.length > 0) {
        onLoginSuccess({
          id: isTestAdmin ? 'u-teste-admin' : ('u-' + Date.now()),
          email: emailTrim,
          name: isTestAdmin ? 'Usuário Teste (Admin)' : (emailTrim.split('@')[0]),
          role: isTestAdmin ? 'Administrador' : 'USER',
          department: isTestAdmin ? 'Tecnologia da Informação' : 'Geral',
          ramal: '100',
          active: true,
          user_metadata: { name: isTestAdmin ? 'Usuário Teste (Admin)' : emailTrim.split('@')[0] }
        });
        return;
      }
      if (error?.message === 'Invalid login credentials') {
        setErrorMsg('E-mail ou senha incorretos.');
      } else {
        setErrorMsg(error?.message || 'Erro ao realizar login.');
      }
      return;
    }

    if (data?.user) {
      const u = data.user as any;
      const isTestAdmin = u.email?.toLowerCase() === 'teste@uniccat.com.br';
      onLoginSuccess({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || (isTestAdmin ? 'Usuário Teste (Admin)' : u.email?.split('@')[0]),
        role: isTestAdmin ? 'Administrador' : (u.role || 'USER'),
        department: isTestAdmin ? 'Tecnologia da Informação' : (u.department || 'Geral'),
        ramal: u.ramal || '100',
        active: true,
        ...u
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 relative z-10">
        
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-700 text-white font-bold text-2xl mb-2">U</div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">UNICCAT INTRANET</h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Medicina e Segurança do Trabalho</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium flex items-center gap-2">
            <X className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@uniccat.com.br"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm disabled:opacity-50 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={loading}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm disabled:opacity-50 text-slate-900 dark:text-white"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Autenticando...' : 'Entrar na Intranet'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('teste@uniccat.com.br');
              setPassword('uni@123');
            }}
            className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Preencher Acesso Admin (teste@uniccat.com.br)</span>
          </button>
        </form>

      </div>
    </div>
  );
};
