import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { ThemeToggle } from '@/components/ui/Themetoggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

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

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
    { met: /[!@#$%^&*]/.test(formData.password), text: 'One special character' },
  ];

  const nextStep = () => {
    if (step === 1) {
      if (!formData.username || !formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!formData.terms) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password does not meet requirements');
      return;
    }

    setLoading(true);
    
    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast.success('Registration successful! Please verify your email.');
      navigate(ROUTES.VERIFY_EMAIL);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
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

  return (
    <div className="h-screen w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSelector />
      </div>
      <div className='w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl flex flex-row h-[600px] overflow-hidden'>
        <div className='hidden lg:block w-1/2 left h-full overflow-hidden relative bg-neutral-900'>
            <img
              src='/images/auth-bg.jpg'
              alt="Registration image"
              className="w-full h-full object-cover transition-transform duration-300"
            />
        </div>

        <div
          className='w-full lg:w-1/2 px-8 lg:px-16 flex flex-col justify-center py-8 relative overflow-hidden'
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
            <div className="form-container sign-in-container z-10 flex flex-col justify-center h-full">
              <form className='text-center flex flex-col h-full justify-center' onSubmit={handleSubmit}>
                <div className='mb-6'>
                  <h1 className='text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white mb-2'>
                    Create Account
                  </h1>
                  <span className='text-sm text-neutral-500 dark:text-neutral-400'>
                    Get started with your free account
                  </span>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                          step >= s ? 'bg-primary-500 shadow-lg shadow-primary-500/30' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500'
                        }`}
                      >
                        {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                      </div>
                      {s < 2 && (
                        <div className={`w-10 h-1 mx-2 rounded transition-all ${
                          step > s ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-800'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className='grid gap-4 items-start text-left flex-1 content-start'>
                  {step === 1 ? (
                    <>
                      <AppInput 
                        placeholder="Username *" 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <AppInput 
                          placeholder="First Name *" 
                          type="text" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        <AppInput 
                          placeholder="Last Name *" 
                          type="text" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AppInput 
                        placeholder="Email Address *" 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <AppInput 
                          placeholder="Password *" 
                          type={showPassword ? 'text' : 'password'} 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 z-30"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {formData.password && (
                        <div className="space-y-1 mb-2 px-1">
                          {passwordRequirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                req.met ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700'
                              }`}>
                                {req.met && <CheckCircle2 className="w-2 h-2 text-white" />}
                              </div>
                              <span className={`text-xs ${
                                req.met ? 'text-green-600 dark:text-green-400' : 'text-neutral-500 dark:text-neutral-500'
                              }`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="relative">
                        <AppInput 
                          placeholder="Confirm Password *" 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 z-30"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 px-1">
                          Passwords do not match
                        </p>
                      )}

                      <div className="mt-2">
                        <label className="flex items-start gap-3 cursor-pointer group mt-2">
                          <input
                            type="checkbox"
                            name="terms"
                            checked={formData.terms}
                            onChange={handleChange}
                            className="w-4 h-4 mt-0.5 rounded border-2 border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                            required
                          />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            I agree to the{' '}
                            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
                            and{' '}
                            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className='flex gap-3 justify-center items-center mt-6'>
                  {step === 2 && (
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button 
                    type={step === 1 ? "button" : "submit"}
                    onClick={step === 1 ? nextStep : undefined}
                    disabled={loading || (step === 2 && (!formData.terms || formData.password !== formData.confirmPassword))}
                    className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex-1"
                  >
                  <span className="px-2 py-1 flex items-center justify-center w-full">
                    {step === 1 ? 'Continue' : (loading ? 'Creating...' : 'Create Account')}
                  </span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                </button>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-400">
                  Already have an account?{" "}
                  <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage;