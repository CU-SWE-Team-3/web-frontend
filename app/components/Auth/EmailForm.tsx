import React, { useState } from 'react';

const EmailForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Proceeding with:", email);
    // This is where you'd trigger the OAuth flow or JWT check
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto px-4">
      <div className="flex flex-col">
        <input 
          type="email" 
          placeholder="Your email address or profile URL"
          className="border border-gray-300 p-2 rounded-sm focus:border-orange-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button 
        type="submit"
        className="bg-[#ff5500] text-white py-2 px-6 rounded-sm font-bold hover:bg-[#e64d00] transition-colors"
      >
        Continue
      </button>
      <p className="text-xs text-gray-500 mt-2">
        By signing in, you agree to our Terms of Use and Privacy Policy.
      </p>
    </form>
  );
};

export default EmailForm;