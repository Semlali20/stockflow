import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { ThemeToggle } from '@/components/ui/Themetoggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const AppInput = (props: InputProps) => {
  const { label, icon, className, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative">
      {label && (
        <label
          className="block mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: '#6B6B94', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          className={`peer relative z-10 h-12 w-full rounded-xl px-4 font-medium outline-none transition-all duration-200 ease-in-out
            bg-white dark:bg-neutral-800/60
            border-2 border-neutral-200 dark:border-neutral-700/60
            text-neutral-900 dark:text-white
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            placeholder:font-normal
            focus:border-primary-500 dark:focus:border-primary-400
            hover:border-primary-300 dark:hover:border-primary-700
            drop-shadow-sm
            ${isFocused ? 'shadow-[0_0_0_3px_rgba(79,70,229,0.14)]' : ''}
            ${className || ''}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}
          {...rest}
        />

        {/* Cursor-tracking border glow */}
        {isHovering && !isFocused && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-xl overflow-hidden"
              style={{
                background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, rgba(79,70,229,0.7) 0%, transparent 70%)`
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-xl overflow-hidden"
              style={{
                background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, rgba(79,70,229,0.5) 0%, transparent 70%)`
              }}
            />
          </>
        )}

        {icon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [initFinished, setInitFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const rememberMe = localStorage.getItem('rememberMe');

    if (rememberMe === 'true' && savedUsername && savedPassword) {
      setFormData({
        usernameOrEmail: savedUsername,
        password: savedPassword,
      });
    }
    setInitFinished(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(formData);
      if (response && response.user) {
        dispatch(setUser(response.user));
        toast.success(t('StockFlow') || 'Welcome back!');
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error: any) {
      toast.error(error.message || t('StockFlow') || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  if (!initFinished) return null;

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 transition-colors duration-500"
      style={{ background: 'var(--theme-bg)', backgroundAttachment: 'fixed' }}
    >
      {/* Atmospheric orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: 500, height: 500,
          top: '-120px', left: '-120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'orbDrift 18s ease-in-out infinite',
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          width: 400, height: 400,
          bottom: '-80px', right: '-80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'orbDriftAlt 22s ease-in-out infinite',
          animationDelay: '-10s',
        }}
      />

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-5xl flex justify-between h-[600px] overflow-hidden rounded-2xl relative"
        style={{
          background: 'var(--theme-surface, white)',
          border: '1px solid rgba(79, 70, 229, 0.12)',
          boxShadow: '0 8px 32px rgba(79,70,229,0.10), 0 32px 80px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Left: Form */}
        <div
          className="w-full lg:w-1/2 px-8 lg:px-14 flex flex-col justify-center h-full relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Cursor glow */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 480, height: 480,
              left: mousePosition.x - 240,
              top: mousePosition.y - 240,
              background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)',
              filter: 'blur(20px)',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease, transform 0.12s ease-out',
            }}
          />

          <div className="form-container sign-in-container h-full z-10 flex flex-col justify-center">
            <form className="grid gap-7" onSubmit={handleSubmit}>

              {/* Brand */}
              <div className="grid gap-1.5 mb-2">
                <h1
                  className="text-4xl font-bold text-neutral-900 dark:text-white"
                  style={{
                    fontFamily: 'Syne, system-ui, sans-serif',
                    letterSpacing: '-0.04em',
                    backgroundImage: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 60%, #06B6D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('StockFlow')}
                </h1>
                <span
                  className="text-sm font-medium"
                  style={{ color: '#8B88B8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {t('Management Inventory')}
                </span>
              </div>

              {/* Fields */}
              <div className="grid gap-4 items-center text-left">
                <AppInput
                  placeholder={t('auth.login.emailPlaceholder') || 'Email'}
                  type="email"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                />
                <AppInput
                  placeholder={t('auth.login.passwordPlaceholder') || 'Password'}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Forgot password */}
              <div className="flex justify-start items-center text-sm -mt-2">
                <a
                  href="#"
                  className="text-xs font-semibold transition-colors hover:underline"
                  style={{ color: '#4F46E5' }}
                >
                  {t('auth.login.forgotPassword')}
                </a>
              </div>

              {/* Submit */}
              <div className="flex gap-4 justify-center items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-xl px-10 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: loading
                      ? 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)'
                      : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4338CA 100%)',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.30), 0 8px 28px rgba(79,70,229,0.22), inset 0 1px 0 rgba(255,255,255,0.20)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(79,70,229,0.38), 0 14px 36px rgba(79,70,229,0.28), inset 0 1px 0 rgba(255,255,255,0.24)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(79,70,229,0.30), 0 8px 28px rgba(79,70,229,0.22), inset 0 1px 0 rgba(255,255,255,0.20)';
                  }}
                >
                  <span className="px-2 py-1">
                    {loading ? t('auth.login.signingInBtn') : t('auth.login.signInBtn')}
                  </span>
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-700 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                    <div className="relative h-full w-10 bg-white/25" />
                  </div>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right: Image */}
        <div className="hidden lg:block w-1/2 right h-full overflow-hidden relative">
          {/* Overlay gradient */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.25) 0%, rgba(124,58,237,0.15) 50%, rgba(6,182,212,0.15) 100%)',
              mixBlendMode: 'multiply',
            }}
          />
          <img
            src="/images/auth-bg.jpg"
            alt="Warehouse"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
