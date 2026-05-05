
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Lado esquerdo */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1920')" }}
        />
        <div className="absolute inset-0 bg-brand-midnight/90 z-10 mix-blend-multiply" />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full pb-16">
          <div className="mb-12">
            <BrandLogo dark horizontal={false} showSubtitle className="scale-[1.2] origin-left" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-mono text-brand-snow mb-6 leading-tight">
            Redefinição de senha
          </h1>
          <p className="text-lg text-brand-gray-light font-sans max-w-lg leading-relaxed">
            Escolha uma nova senha segura para proteger o seu acesso à plataforma.
          </p>
        </div>
      </div>

      {/* Lado direito */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-brand-gray-bg p-8 font-sans">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <BrandLogo horizontal={false} showSubtitle />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-mono font-bold text-brand-midnight tracking-tight">Nova senha</h2>
            <p className="text-brand-gray mt-2 font-sans">Defina uma senha forte para sua conta.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {done ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Senha redefinida!</h3>
              <p className="text-gray-500 text-sm">
                Sua senha foi atualizada com sucesso.<br />
                Você será redirecionado para o login em instantes...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nova senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar nova senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? 'Salvando...' : 'Salvar nova senha'}
                {!isLoading && <Check size={20} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
