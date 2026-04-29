import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign In - BioBeats',
  description: 'Sign in to your BioBeats account',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Sign in</h1>
        <p className="text-[#999] text-sm mt-1">to continue to BioBeats</p>
      </div>
      <LoginForm />
    </div>
  );
}
