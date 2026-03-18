import React from 'react';
import './SocialLogins.scss';

const SocialLogins = () => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-4">
      {/* Google Login Button */}
      <button className="social-btn google flex items-center justify-center py-2 px-4 rounded-sm text-white font-medium">
        <span className="mr-2">Continue with Google</span>
      </button>

      {/* Facebook Login Button */}
      <button className="social-btn facebook flex items-center justify-center py-2 px-4 rounded-sm text-white font-medium">
        <span className="mr-2">Continue with Facebook</span>
      </button>
      
      <div className="divider flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
    </div>
  );
};

export default SocialLogins;