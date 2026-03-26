import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return setError('Please enter a 6-digit code.');
    
    setError('');
    setLoading(true);
    try {
      await api.post('/register/verify/', { email, code });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. The code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-6 flex flex-col items-center">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100/50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900 w-full">
                {error}
              </div>
            )}
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
              {loading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
