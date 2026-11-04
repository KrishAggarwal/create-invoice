import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/tabs';
import { Input, FormField } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from '../../lib/validations/auth';
import { ArrowRight, User, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
}: AuthModalProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form with react-hook-form & Zod resolver
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  // Register form with react-hook-form & Zod resolver
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      workspaceName: '',
      entityType: 'individual',
    },
    mode: 'onBlur',
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'register');
    setServerError(null);
    setSuccessMsg(null);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await register(
        data.email,
        data.password,
        data.fullName,
        data.phone,
        data.workspaceName,
        data.entityType
      );
      registerForm.reset();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-[500px] max-w-lg p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
            {activeTab === 'login' ? 'Sign in to your account' : 'Create your account'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {activeTab === 'login'
              ? 'Access saved clients, payment profiles, and invoices'
              : 'Save clients automatically, track payments, and manage invoices'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          {serverError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          <TabsContent value="login" className="mt-4">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                label="Email Address"
                required
                error={loginForm.formState.errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  error={Boolean(loginForm.formState.errors.email)}
                  {...loginForm.register('email')}
                />
              </FormField>

              <FormField
                label="Password"
                required
                error={loginForm.formState.errors.password?.message}
              >
                <Input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={Boolean(loginForm.formState.errors.password)}
                  {...loginForm.register('password')}
                />
              </FormField>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2"
                size="lg"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* ── Register Form ── */}
          <TabsContent value="register" className="mt-4">
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">
              <FormField
                label="Full Name"
                required
                error={registerForm.formState.errors.fullName?.message}
              >
                <Input
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  error={Boolean(registerForm.formState.errors.fullName)}
                  {...registerForm.register('fullName')}
                />
              </FormField>

              {/* Mandatory Phone Number */}
              <FormField
                label="Phone Number"
                required
                error={registerForm.formState.errors.phone?.message}
              >
                <Input
                  type="tel"
                  placeholder="+1 (555) 012-3456"
                  autoComplete="tel"
                  error={Boolean(registerForm.formState.errors.phone)}
                  {...registerForm.register('phone')}
                />
              </FormField>

              {/* Account Type Toggle */}
              <div className="space-y-1.5">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => registerForm.setValue('entityType', 'individual')}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      registerForm.watch('entityType') === 'individual'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <User className="w-3.5 h-3.5" /> Individual
                    </div>
                    <div
                      className={`text-[11px] ${
                        registerForm.watch('entityType') === 'individual'
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      Independent contractor or freelancer
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => registerForm.setValue('entityType', 'agency')}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      registerForm.watch('entityType') === 'agency'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Building2 className="w-3.5 h-3.5" /> Business / Agency
                    </div>
                    <div
                      className={`text-[11px] ${
                        registerForm.watch('entityType') === 'agency'
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      Registered company or team
                    </div>
                  </button>
                </div>
              </div>

              <FormField
                label="Company / Brand Name (optional)"
                error={registerForm.formState.errors.workspaceName?.message}
              >
                <Input
                  type="text"
                  placeholder="Company or brand name"
                  error={Boolean(registerForm.formState.errors.workspaceName)}
                  {...registerForm.register('workspaceName')}
                />
              </FormField>

              <FormField
                label="Email Address"
                required
                error={registerForm.formState.errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  error={Boolean(registerForm.formState.errors.email)}
                  {...registerForm.register('email')}
                />
              </FormField>

              <FormField
                label="Password"
                required
                error={registerForm.formState.errors.password?.message}
              >
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  error={Boolean(registerForm.formState.errors.password)}
                  {...registerForm.register('password')}
                />
              </FormField>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2"
                size="lg"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    Create Account <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
