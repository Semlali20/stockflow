import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/Themetoggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/config/constants';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';

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

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 2000);
  };

  const handleResend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
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
              className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 via-primary-500/10 to-teal-500/10 rounded-full blur-3xl transition-opacity duration-200 ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div className="form-container h-full z-10 flex flex-col justify-center">
              {!emailSent ? (
                <form className='text-center grid gap-6' onSubmit={handleSubmit}>
                  <div className='grid gap-2 mb-4'>
                    <h1 className='text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white'>
                      {t('StockFlow')}
                    </h1>
                    <span className='text-sm text-neutral-500 dark:text-neutral-400'>
                      {t('Management Inventory')}
                    </span>
                  </div>

                  <div className="text-left mb-4">
                    <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
                      Forgot Password?
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      No worries! Enter your email and we'll send you reset instructions.
                    </p>
                  </div>
                  
                  <div className='grid gap-4 items-center text-left'>
                    <AppInput 
                      placeholder="Email Address"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      icon={<Send className="w-4 h-4" />}
                    />
                  </div>

                  <div className='flex flex-col gap-4 mt-4'>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="px-2 py-1">{loading ? 'Sending...' : 'Send Reset Link'}</span>
                      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                        <div className="relative h-full w-8 bg-white/20" />
                      </div>
                    </button>
                    
                    <Link to={ROUTES.LOGIN} className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
                    Check your email!
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
                    We've sent a password reset link to <br/>
                    <span className="text-primary-600 dark:text-primary-400">{email}</span>
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl mb-8">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        onClick={handleResend}
                        disabled={loading}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                      >
                        {loading ? 'Sending...' : 'click to resend'}
                      </button>
                    </p>
                  </div>
                  <Link to={ROUTES.LOGIN} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 w-full">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
        </div>
          
        <div className='hidden lg:block w-1/2 right h-full overflow-hidden relative'>
            <img
              src='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200'
              alt="Security image"
              className="w-full h-full object-cover transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-primary-900/20 mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-12 left-12 right-12 text-white z-10">
              <h2 className="text-3xl font-bold mb-4">Secure & Protected 🛡️</h2>
              <p className="text-neutral-100 text-lg">
                Enterprise-grade security for your data. Your security is our top priority.
              </p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage;