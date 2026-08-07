import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Building2,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getUsers, addAuditLog } from '../../lib/storage';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const users = getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!foundUser) {
      setErrorMsg('Usuário não encontrado. Verifique o e-mail digitado ou selecione um perfil de teste.');
      return;
    }

    if (!foundUser.active) {
      setErrorMsg('Sua conta está temporariamente bloqueada pelo administrador.');
      return;
    }

    const validPassword = foundUser.password || 'senha123';
    if (password !== validPassword) {
      setErrorMsg('Senha incorreta. Verifique a senha informada ou solicite o reenvio.');
      return;
    }

    // Login successful
    addAuditLog(foundUser, 'LOGIN', 'Login bem-sucedido via tela de autenticação.');
    onLoginSuccess(foundUser);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setEmail(user.email);
    setPassword('senha123');
    addAuditLog(user, 'LOGIN', `Login de teste como ${user.role}.`);
    onLoginSuccess(user);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotModalOpen(false);
      setForgotEmail('');
    }, 3000);
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
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@uniccat.com.br"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition"
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
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition"
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

            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-blue-700 dark:text-blue-400 hover:underline font-semibold"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition"
          >
            <span>Entrar na Intranet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Test Accounts Picker */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">
            Perfis de Teste Rápidos (Demonstração)
          </p>

          <div className="grid grid-cols-2 gap-2">
            {users.slice(0, 4).map(u => (
              <button
                key={u.id}
                onClick={() => handleQuickLogin(u)}
                className="p-2 bg-slate-50 hover:bg-blue-50/60 dark:bg-slate-950/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-lg text-left transition flex items-center gap-2 group"
              >
                <img src={u.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate">{u.name.split(' ')[0]}</p>
                  <p className="text-[9px] text-blue-600 dark:text-blue-400 font-medium truncate">{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sessão protegida por criptografia de dados UNICCAT</span>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative">
            <button 
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Recuperar Senha</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Informe seu e-mail corporativo para receber as instruções de redefinição de acesso.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instruções enviadas para o e-mail informado!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="seu.email@uniccat.com.br"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Enviar Link de Redefinição
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
