"use client";
import React from 'react';
import SocialLogins from './SocialLogins';
import EmailForm from './EmailForm';
import './SocialLogins.scss'; // reuse existing styles for social buttons

interface AuthModalProps {
  onClose?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="auth-modal-content w-[450px] p-8 relative rounded-sm shadow-2xl bg-white text-black">
        {/* Close Button (The X in the corner) */}
        <button
          className="absolute top-4 right-4 text-black text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        <h1 className="text-2xl font-bold mb-2">Sign in or create an account</h1>

        <p className="text-[11px] text-gray-400 mb-6 leading-tight">
          By clicking on any of the &ldquo;Continue&rdquo; buttons below, you agree to 
          SoundCloud&apos;s <span className="text-blue-500">Terms of Use</span> and 
          acknowledge our <span className="text-blue-500">Privacy Policy</span>.
        </p>

        {/* Social login buttons component handles Google/Facebook/Apple */}
        <SocialLogins />

        <div className="divider-text my-4 text-center text-gray-500">Or with email</div>

        {/* Email input form */}
        <EmailForm />

        <button className="text-blue-500 text-sm hover:underline mt-4">
          Need help?
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
