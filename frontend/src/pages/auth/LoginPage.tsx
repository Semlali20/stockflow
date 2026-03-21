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

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative">
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div className="h-screen w-full flex items-center justify-center p-4 transition-colors duration-500">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSelector />
      </div>
      <div className='w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex justify-between h-[600px] overflow-hidden transition-all duration-300'>
        <div
          className='w-full lg:w-1/2 px-8 lg:px-16 flex flex-col justify-center h-full relative overflow-hidden'
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
          <div
            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 via-primary-500/10 to-teal-500/10 rounded-full blur-3xl transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div className="form-container sign-in-container h-full z-10 flex flex-col justify-center">
            <form className='text-center grid gap-6' onSubmit={handleSubmit}>
              <div className='grid gap-2 mb-4'>
                <h1 className='text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white'>
                  {t('StockFlow')}
                </h1>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>
                  {t('Management Inventory')}
                </span>
              </div>

              <div className='grid gap-4 items-center text-left'>
                <AppInput
                  placeholder={t('auth.login.emailPlaceholder') || "Email"}
                  type="email"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                />
                <AppInput
                  placeholder={t('auth.login.passwordPlaceholder') || "Password"}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-start items-center text-sm mt-2">
                <a href="#" className='font-light text-primary-600 hover:text-primary-700 dark:text-primary-400'>
                  {t('auth.login.forgotPassword')}
                </a>
              </div>

              <div className='flex gap-4 justify-center items-center mt-4'>
                <button
                  type="submit"
                  disabled={loading}
                  className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="px-2 py-1">{loading ? t('auth.login.signingInBtn') : t('auth.login.signInBtn')}</span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                </button>
              </div>

            </form>
          </div>
        </div>

        <div className='hidden lg:block w-1/2 right h-full overflow-hidden relative'>
            <img
              src='/images/auth-bg.jpg'
              alt="Warehouse image"
              className="w-full h-full object-cover transition-transform duration-300"
            />
        </div>
      </div>
    </div>
  )
}

export default LoginPage;