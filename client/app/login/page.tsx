'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SquareCheck as CheckSquare, Mail, Lock, ChartLine, MonitorSmartphone, Loader2 } from 'lucide-react';
import authApi  from '../../lib/app';
import { useAuth } from '../../Hooks/useAuth';
import { toast } from 'react-hot-toast';

import { API_ENDPOINTS } from '../../utils/constants';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.post(API_ENDPOINTS.LOGIN, { email, password });
      console.log('Login response:', response.data);
      login(response.data.accessToken, response.data.refreshToken,response.data.user);
      // console.log(localStorage.getItem("token"));
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
        const message = error?.response?.data?.message || "Login failed. Please try again.";
        toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className='w-4 h-4 animate-spin'  />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
   
      <div className="max-w-3xl w-full space-y-8">

        <div className="bg-white rounded-2xl shadow-xl  flex p-8">
                <div className="hidden md:flex flex-col justify-center items-start w-1/2 bg-gray-50 p-8 rounded-l-2xl">
  <h2 className="text-3xl font-bold text-indigo-600 mb-3">
    Welcome Back
  </h2>
  <p className="text-sm text-gray-500 mb-6">
    Login to access your tasks and stay organized with TaskMate.
  </p>
  <p className="text-sm text-gray-500 mb-6">
        We&apos;re excited to have you back!

  </p>

  <ul className="space-y-3 text-sm text-gray-600">
    <li><ChartLine className='inline text-indigo-400' /> Track your daily tasks</li>
    <li><MonitorSmartphone className='inline text-indigo-400' /> Fast and responsive UI</li>
    <li><Lock className='inline text-indigo-400' /> Secure authentication</li>
  </ul>
</div>
  <div className='w-full md:w-80'>

 
          
           <h3 className='text-2xl font-semibold py-3 text-slate-500'>Login to Your Account</h3>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex cursor-pointer justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                 
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </Link>
            </p>
          </div>
           </div>
        </div>
      </div>
 
    </div>
  );
}
