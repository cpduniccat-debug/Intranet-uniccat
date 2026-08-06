import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Phone, 
  Mail, 
  Building, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  FileText,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { saveUser, updateUserPassword, addAuditLog } from '../../lib/storage';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateCurrentUser: (user: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateCurrentUser }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Edit Profile Info State
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    extension: currentUser.extension || '',
    phone: currentUser.phone || '',
    mobile: currentUser.mobile || '',
    location: currentUser.location || 'Sede São Paulo - SP',
    bio: currentUser.bio || '',
    photoUrl: currentUser.photoUrl
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Save profile info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileData.name.trim()) {
      setProfileError('O nome não pode estar em branco.');
      return;
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      name: profileData.name.trim(),
      extension: profileData.extension.trim(),
      phone: profileData.phone.trim(),
      mobile: profileData.mobile.trim(),
      location: profileData.location.trim(),
      bio: profileData.bio.trim(),
      photoUrl: profileData.photoUrl
    };

    saveUser(updatedUser);
    onUpdateCurrentUser(updatedUser);
    addAuditLog(currentUser, 'EDITAR_PERMISSAO', 'Dados pessoais do perfil atualizados pelo próprio usuário.');

    setProfileSuccess('Perfil atualizado com sucesso!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    const actualPassword = currentUser.password || 'senha123';

    if (!currentPassword) {
      setPwError('Por favor digite sua senha atual.');
      return;
    }

    if (currentPassword !== actualPassword) {
      setPwError('A senha atual digitada está incorreta.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPwError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('A confirmação da nova senha não coincide com a nova senha digitada.');
      return;
    }

    if (newPassword === currentPassword) {
      setPwError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    // Update password
    updateUserPassword(currentUser.id, newPassword);

    const updatedUser: UserProfile = {
      ...currentUser,
      password: newPassword
    };
    onUpdateCurrentUser(updatedUser);

    addAuditLog(currentUser, 'EDITAR_PERMISSAO', 'Senha de acesso alterada com sucesso pelo perfil do usuário.');

    setPwSuccess('Sua senha foi alterada com sucesso! Utilize a nova senha no seu próximo acesso.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setPwSuccess(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Profile Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
        
        <div className="relative shrink-0">
          <img
            src={currentUser.photoUrl}
            alt={currentUser.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-blue-600 shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" title="Usuário Ativo" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] rounded-full uppercase">
              {currentUser.role}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentUser.department}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentUser.email}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ramal: {currentUser.extension || '100'}</span>
            </span>
          </p>

          {currentUser.bio && (
            <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
              "{currentUser.bio}"
            </p>
          )}
        </div>

      </div>

      {/* Main Tabs Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tab Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Dados Pessoais & Contato
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'password'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" /> Alterar Senha de Acesso
          </button>
        </div>

        <div className="p-6">
          
          {/* TAB 1: EDIT PROFILE INFO */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Editar Informações do Meu Perfil</span>
                </h3>
                <span className="text-[11px] text-slate-400">Campos marcados com * são obrigatórios</span>
              </div>

              {profileError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo (Apenas Leitura)</label>
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ramal Interno</label>
                  <input
                    type="text"
                    value={profileData.extension}
                    onChange={e => setProfileData({ ...profileData, extension: e.target.value })}
                    placeholder="Ex: 104"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={profileData.mobile}
                    onChange={e => setProfileData({ ...profileData, mobile: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unidade / Local de Trabalho</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Unidade Matriz - SP"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cargo / Departamento</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.role} (${currentUser.department})`}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>

              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Escolha sua Foto de Perfil</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Avatar preset"
                      onClick={() => setProfileData({ ...profileData, photoUrl: url })}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer transition ring-2 ${
                        profileData.photoUrl === url ? 'ring-blue-600 scale-110' : 'ring-transparent hover:opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apresentação / Bio Profissional</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Escreva brevemente sobre suas responsabilidades na UNICCAT..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados do Perfil</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-5 text-xs max-w-lg">
              
              <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Alterar Minha Senha de Acesso</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mantenha sua conta corporativa segura definindo uma nova senha individual
                </p>
              </div>

              {pwError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              {pwSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                  <span>{pwSuccess}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Senha Atual *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Informe sua senha atual..."
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nova Senha *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres..."
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirmar Nova Senha *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha..."
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Atualizar Minha Senha</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
