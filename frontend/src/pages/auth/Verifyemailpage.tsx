import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth.service';
import { ThemeToggle } from '@/components/ui/Themetoggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2, Clock, Mail } from 'lucide-react';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error' | 'expired';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const AppInput = (props: InputProps) => {
  const { label, icon, className, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full relative">
      {label && 
        <label className='block mb-2 text-sm text-neutral-700 dark:text-neutral-300'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          className={`peer relative z-10 border-2 border-neutral-200 dark:border-neutral-700 h-12 w-full rounded-md bg-white dark:bg-neutral-800 px-4 font-normal outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-neutral-50 dark:focus:bg-neutral-900 placeholder:font-medium text-neutral-900 dark:text-white ${className || ''}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--tw-colors-primary-500, #8b5cf6) 0%, transparent 70%)`
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--tw-colors-primary-500, #8b5cf6) 0%, transparent 70%)`
              }}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    try {
      await authService.verifyEmail(verificationToken);
      setStatus('success');
      toast.success('Email verified successfully!');
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      setStatus(errorMessage.includes('expired') ? 'expired' : 'error');
      toast.error(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setResending(true);
    try {
      await authService.resendVerificationEmail(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-6">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">Check inbox</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">We've sent a link to your email address.</p>
            <div className="grid gap-4 text-left">
              <AppInput 
                placeholder="your@email.com" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />
              <button 
                onClick={handleResendEmail}
                disabled={resending}
                className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer disabled:opacity-70 flex-1"
              >
                <span className="px-2 py-1">{resending ? 'Sending...' : 'Resend link'}</span>
              </button>
            </div>
          </div>
        );
      case 'verifying':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Verifying email...</h2>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">Verified! 🎉</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">Redirecting to login page...</p>
            <button 
              onClick={() => navigate(ROUTES.LOGIN)}
              className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer w-full"
            >
              <span className="px-2 py-1">Go to Login</span>
            </button>
          </div>
        );
      case 'expired':
      case 'error':
        return (
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${status === 'expired' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
              {status === 'expired' ? <Clock className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">Please try again or register once more.</p>
            <div className="grid gap-3">
               <button 
                onClick={() => navigate(ROUTES.REGISTER)}
                className="px-8 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors w-full"
              >
                Register Again
              </button>
              <Link to={ROUTES.LOGIN} className="text-sm font-bold text-primary-600 hover:underline">Back to Login</Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSelector />
      </div>
      <div className='w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl flex justify-between h-[600px] overflow-hidden'>
        <div
          className='w-full lg:w-1/2 px-8 lg:px-16 flex flex-col justify-center h-full relative overflow-hidden'
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
            <div
              className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 via-primary-500/10 to-teal-500/10 rounded-full blur-3xl transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div className="z-10 flex flex-col justify-center h-full">
              <div className='text-center grid gap-2 mb-8'>
                <h1 className='text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white'>{t('StockFlow')}</h1>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>{t('Management Inventory')}</span>
              </div>
              {renderContent()}
            </div>
        </div>
        <div className='hidden lg:block w-1/2 right h-full overflow-hidden relative'>
            <img
              src='https://images.unsplash.com/photo-1586528116311-ad8ed7c6636c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
              alt="Verification background"
              className="w-full h-full object-cover transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-primary-900/15 mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-12 left-12 right-12 text-white z-10">
              <h2 className="text-3xl font-bold mb-4">Almost there! 🚀</h2>
              <p className="text-neutral-100 text-lg">Verify your email to start managing your inventory with enterprise precision.</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage;