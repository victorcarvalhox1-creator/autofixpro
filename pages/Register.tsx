
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, ArrowRight, Check, AlertCircle, RefreshCw, Camera } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'otp'>('register');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.group('%c[Register] supabase.auth.signUp()', 'color:#F59E0B;font-weight:bold');
      console.log('Email:', email);
      console.log('Data:', data);
      if (error) {
        console.error('Erro completo:', error);
        console.error('Mensagem:', error.message);
        console.error('Status:', (error as any).status);
        console.error('Código:', (error as any).code);
        console.error('Detalhes:', JSON.stringify(error, null, 2));
      }
      console.groupEnd();

      if (error) {
         throw error;
      }
      
      // Proteção do Supabase contra Enumeração de E-mails
      // Se o usuário tentar se cadastrar de novo e já existir, o Supabase não retorna 'error' 
      // para não confirmar que o e-mail existe a um atacante, mas as 'identities' vêm vazias.
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
         throw new Error("Este e-mail já está cadastrado ou aguardando confirmação.");
      }

      setSuccessMsg('Cadastro iniciado! Verifique seu e-mail pelo código de 8 dígitos.');
      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      console.group('%c[Register] FALHA no cadastro', 'color:red;font-weight:bold');
      console.error('Mensagem:', err.message);
      console.error('Status:', err.status);
      console.error('Código:', err.code);
      console.error('Objeto completo:', JSON.stringify(err, null, 2));
      console.groupEnd();
      setError(err.message || 'Erro ao tentar se conectar ao servidor.');
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

      if (data.session && avatarFile) {
        const userId = data.session.user.id;
        const ext = avatarFile.name.split('.').pop();
        const path = `${userId}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
          await supabase.auth.updateUser({ data: { avatar_url: urlData.publicUrl } });
        }
      }

      if (data.session) {
        navigate('/');
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
    <div className="min-h-screen flex w-full">
      {/* Lado Esquerdo */}
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
            Comece sua jornada conosco
          </h1>
          <p className="text-lg text-brand-gray-light font-sans max-w-lg leading-relaxed">
            Junte-se a oficinas modernas que utilizam inteligência para gerenciar serviços, controle financeiro e aumentar a produtividade.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
                <p className="text-gray-500 mt-2">Preencha os dados para começar.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-100 animate-pulse">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-green-100">
                <Check size={18} />
                {successMsg}
              </div>
            )}

            {step === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-5">

                {/* Avatar picker */}
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer group relative">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-colors overflow-hidden flex items-center justify-center bg-gray-50">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                          <Camera size={28} />
                          <span className="text-xs font-medium">Foto</span>
                        </div>
                      )}
                    </div>
                    {avatarPreview && (
                      <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                        <Camera size={13} className="text-white" />
                      </div>
                    )}
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <span className="text-xs text-gray-400">Foto de perfil (opcional)</span>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
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

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
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
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar Senha</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-2 disabled:opacity-70 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                    {isLoading ? 'Enviando...' : 'Criar Conta'}
                    {!isLoading && <ArrowRight size={20} />}
                </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-800 mb-2">
                            Enviamos um código de verificação para:
                        </p>
                        <p className="font-bold text-lg text-blue-800 break-all">{email}</p>
                        <p className="text-xs text-gray-500 mt-3">
                            Verifique sua caixa de entrada e <strong>Spam</strong>.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Código de Verificação</label>
                        <div className="relative">
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
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-70 transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {isLoading ? 'Validando...' : 'Confirmar Código'}
                        {!isLoading && <Check size={20} />}
                    </button>

                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={handleResendEmail}
                            disabled={resendTimer > 0 || isLoading}
                            className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed py-2"
                        >
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : 'Reenviar código por e-mail'}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setStep('register')}
                            className="text-center text-sm text-gray-500 hover:text-gray-700 py-1"
                        >
                            Corrigir e-mail
                        </button>
                    </div>
                </form>
            )}

            <div className="text-center pt-4">
                <p className="text-gray-500">
                    Já tem uma conta? <Link to="/login" className="text-blue-600 font-bold hover:underline transition-colors">Fazer Login</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
