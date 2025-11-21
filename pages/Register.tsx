
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Wrench, Mail, Lock, ArrowRight, Check, AlertCircle, RefreshCw } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estado para o temporizador de reenvio
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      setSuccessMsg('Cadastro iniciado! Verifique seu e-mail (inclusive Spam).');
      setStep('otp');
      setResendTimer(60); // Inicia contagem para permitir reenvio
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      setSuccessMsg('Novo código enviado! Verifique sua caixa de entrada.');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar e-mail.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) throw error;

      if (data.session) {
        navigate('/'); // Redireciona para o dashboard logado
      } else {
          navigate('/login');
      }
      
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ 
        // Substitua esta URL pela URL da sua foto se desejar
        backgroundImage: "url('https://images.unsplash.com/photo-1562519819-016930ada31b?q=80&w=2670&auto=format&fit=crop')" 
      }}
    >
      {/* Overlay Escuro */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 z-10 mx-4 border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Wrench size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Crie sua conta</h1>
          <p className="text-gray-500 mt-2">Gestão de Funilaria e Pintura</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 mb-4 animate-pulse">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-100 mb-4">
            <Check size={16} />
            {successMsg}
          </div>
        )}

        {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                </div>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 focus:bg-white"
                    placeholder="seu@email.com"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                </div>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 focus:bg-white"
                    placeholder="••••••"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                </div>
                <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/50 focus:bg-white"
                    placeholder="••••••"
                />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-6 disabled:opacity-70 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isLoading ? 'Enviando...' : 'Criar Conta'}
                {!isLoading && <ArrowRight size={18} />}
            </button>
            </form>
        ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-800 mb-1">
                        Um código de verificação foi enviado para:
                    </p>
                    <p className="font-bold text-blue-800 break-all">{email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Não encontrou? Verifique sua caixa de <strong>Spam</strong>.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de Verificação</label>
                    <div className="relative">
                    <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-xl font-mono bg-white/50 focus:bg-white"
                        placeholder="12345678"
                        maxLength={8}
                    />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg mt-6 disabled:opacity-70 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? 'Validando...' : 'Confirmar Cadastro'}
                    {!isLoading && <Check size={18} />}
                </button>

                <div className="flex flex-col gap-3 mt-6">
                    <button 
                        type="button"
                        onClick={handleResendEmail}
                        disabled={resendTimer > 0 || isLoading}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : 'Reenviar código por e-mail'}
                    </button>

                    <button 
                        type="button" 
                        onClick={() => setStep('register')}
                        className="text-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        Voltar e corrigir e-mail
                    </button>
                </div>
            </form>
        )}

        <div className="text-center mt-6 border-t pt-6">
            <p className="text-sm text-gray-600">
                Já tem uma conta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Fazer Login</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
