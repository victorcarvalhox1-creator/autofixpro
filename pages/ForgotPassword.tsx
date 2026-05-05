
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, ArrowLeft, Check, AlertCircle, RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

type Step = 'email' | 'otp' | 'password';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setStep('otp');
      setResendTimer(60);
      setSuccessMsg('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar o código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSuccessMsg('Novo código enviado!');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      });
      if (error) throw error;
      setStep('password');
      setSuccessMsg('');
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
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
      setSuccessMsg('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const leftSideText: Record<Step, { title: string; sub: string }> = {
    email: {
      title: 'Recupere seu acesso',
      sub: 'Informe seu e-mail e enviaremos um código para redefinir sua senha.',
    },
    otp: {
      title: 'Verifique seu e-mail',
      sub: 'Digite o código de verificação que enviamos para confirmar sua identidade.',
    },
    password: {
      title: 'Crie uma nova senha',
      sub: 'Escolha uma senha forte para proteger o acesso à plataforma.',
    },
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
            {leftSideText[step].title}
          </h1>
          <p className="text-lg text-brand-gray-light font-sans max-w-lg leading-relaxed">
            {leftSideText[step].sub}
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
            <h2 className="text-3xl font-mono font-bold text-brand-midnight tracking-tight">
              {step === 'email' && 'Esqueceu a senha?'}
              {step === 'otp' && 'Digite o código'}
              {step === 'password' && 'Nova senha'}
            </h2>
            <p className="text-brand-gray mt-2 font-sans">
              {step === 'email' && 'Informe seu e-mail para receber o código.'}
              {step === 'otp' && `Código enviado para ${email}.`}
              {step === 'password' && 'Defina uma nova senha para sua conta.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-green-100">
              <Check size={18} /> {successMsg}
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={14} /> Voltar para o login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-800 mb-2">Código enviado para:</p>
                <p className="font-bold text-lg text-blue-800 break-all">{email}</p>
                <p className="text-xs text-gray-500 mt-3">Verifique sua caixa de entrada e a pasta de <strong>Spam</strong>.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Código de verificação</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center tracking-[0.5em] text-2xl font-mono font-bold transition-all"
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? 'Verificando...' : 'Verificar código'}
                {!isLoading && <Check size={20} />}
              </button>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed py-2"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : 'Reenviar código'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                  className="text-center text-sm text-gray-500 hover:text-gray-700 py-1"
                >
                  Corrigir e-mail
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Nova senha */}
          {step === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
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

export default ForgotPassword;
