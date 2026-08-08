import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabaseClient';
import { getUsers, saveUser } from '../../lib/storage';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void; 
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    const emailTrim = email.trim().toLowerCase();

    // 1. Tenta autenticar via Supabase Auth se configurado
    if (supabaseUrl && supabaseAnonKey !== 'placeholder-key') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrim,
        password: password,
      });

      if (!error && data?.user) {
        setLoading(false);
        const u = data.user as any;
        const validRoles = ['Administrador', 'RH', 'Financeiro', 'Comercial', 'Recepção', 'Médico', 'Coordenador', 'Gestor', 'Funcionário'];
        
        let appRole = 'Administrador';
        if (validRoles.includes(u.user_metadata?.role)) {
          appRole = u.user_metadata.role;
        } else if (validRoles.includes(u.role) && u.role !== 'authenticated' && u.role !== 'USER') {
          appRole = u.role;
        }

        const loggedUser = {
          ...u,
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name || u.email?.split('@')[0].replace('.', ' ').toUpperCase(),
          role: appRole,
          department: u.user_metadata?.department || 'Tecnologia da Informação',
          ramal: u.user_metadata?.ramal || '100',
          active: true
        };

        saveUser(loggedUser);
        onLoginSuccess(loggedUser);
        return;
      }
    }

    // 2. Fallback de verificação contra usuários cadastrados no sistema
    const registeredUsers = getUsers();
    const matchedUser = registeredUsers.find(
      u => u.email?.toLowerCase() === emailTrim && (u.password === password || !u.password)
    );

    setLoading(false);

    if (matchedUser) {
      if (!matchedUser.active) {
        setErrorMsg('Usuário inativo. Entre em contato com o Administrador.');
        return;
      }
      onLoginSuccess(matchedUser);
      return;
    }

    // 3. Se for o primeiro acesso de uma conta corporativa válida
    if (emailTrim.endsWith('@uniccat.com.br') && password.length >= 4) {
      const newUser = {
        id: 'u-' + Date.now(),
        email: emailTrim,
        name: emailTrim.split('@')[0].replace('.', ' ').toUpperCase(),
        role: registeredUsers.length === 0 ? 'Administrador' : 'Funcionário',
        department: 'Tecnologia da Informação',
        ramal: '100',
        active: true
      };
      onLoginSuccess(newUser);
      return;
    }

    setErrorMsg('E-mail ou senha incorretos.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 relative z-10">
        
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-700 text-white font-bold text-2xl mb-2 shadow-md">U</div>
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
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm transition"
          >
            <span>{loading ? 'Autenticando...' : 'Entrar na Intranet'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

      </div>
    </div>
  );
};
