"use client";

import React from "react";
import { BlockedUsersList } from "@/features/social-graph";

export default function BlockedUsersPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-[24px] font-bold text-white mb-6">
          Settings
        </h1>

        {/* Horizontal Tabs */}
        <div className="border-b border-[#333] mb-8">
          <nav className="flex gap-0">
            <a href="#" className="px-0 mr-6 pb-3 text-[14px] text-[#999] hover:text-white transition-colors border-b-2 border-transparent">
              Account
            </a>
            <a href="#" className="px-0 mr-6 pb-3 text-[14px] text-[#999] hover:text-white transition-colors border-b-2 border-transparent">
              Content
            </a>
            <a href="#" className="px-0 mr-6 pb-3 text-[14px] text-[#999] hover:text-white transition-colors border-b-2 border-transparent">
              Notifications
            </a>
            <a href="#" className="px-0 mr-6 pb-3 text-[14px] font-bold text-white border-b-2 border-[#f50] cursor-default">
              Privacy
            </a>
            <a href="#" className="px-0 mr-6 pb-3 text-[14px] text-[#999] hover:text-white transition-colors border-b-2 border-transparent">
              Advertising
            </a>
            <a href="#" className="px-0 mr-6 pb-3 text-[14px] text-[#999] hover:text-white transition-colors border-b-2 border-transparent">
              2FA
            </a>
          </nav>
        </div>

        {/* Privacy Settings Section */}
        <div className="mb-10">
          <h2 className="text-[16px] font-bold text-[#f50] mb-6">
            Privacy settings
          </h2>

          {/* Toggle: Receive messages from anyone */}
          <div className="flex items-start justify-between mb-6 gap-8">
            <div>
              <h3 className="text-[14px] font-bold text-white mb-1">
                Receive messages from anyone
              </h3>
              <p className="text-[12px] text-[#999] leading-relaxed max-w-lg">
                For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages.
              </p>
            </div>
            <label className="sc-toggle">
              <input type="checkbox" defaultChecked />
              <span className="sc-toggle-slider" />
            </label>
          </div>

          {/* Toggle: Show activities */}
          <div className="flex items-start justify-between mb-6 gap-8">
            <div>
              <h3 className="text-[14px] font-bold text-white mb-1">
                Show my activities in social discovery playlists and modules
              </h3>
              <p className="text-[12px] text-[#999] leading-relaxed max-w-lg">
                Your Likes, Reactions and other engagement may be shown to other users in discovery features such as &apos;Liked By&apos; playlists or update feeds. Turning this off won&apos;t hide your Likes on your profile or tracks.
              </p>
            </div>
            <label className="sc-toggle">
              <input type="checkbox" defaultChecked />
              <span className="sc-toggle-slider" />
            </label>
          </div>

          {/* Toggle: Show First or Top Fan */}
          <div className="flex items-start justify-between mb-6 gap-8">
            <div>
              <h3 className="text-[14px] font-bold text-white mb-1">
                Show when I&apos;m a First or Top Fan
              </h3>
              <p className="text-[12px] text-[#999] leading-relaxed max-w-lg">
                Appear in public Top Fans and First Fans lists
              </p>
            </div>
            <label className="sc-toggle">
              <input type="checkbox" defaultChecked />
              <span className="sc-toggle-slider" />
            </label>
          </div>

          {/* Toggle: Show First and Top Fans for my tracks */}
          <div className="flex items-start justify-between mb-6 gap-8">
            <div>
              <h3 className="text-[14px] font-bold text-white mb-1">
                Show First and Top Fans for my tracks
              </h3>
              <p className="text-[12px] text-[#999] leading-relaxed max-w-lg">
                Your First and Top Fans will appear on your tracks
              </p>
            </div>
            <label className="sc-toggle">
              <input type="checkbox" defaultChecked />
              <span className="sc-toggle-slider" />
            </label>
          </div>
        </div>

        {/* Blocked Users Section */}
        <div className="mb-10">
          <h2 className="text-[16px] font-bold text-white mb-4">
            Blocked users
          </h2>
          <BlockedUsersList />
        </div>

        {/* Cookies Section */}
        <div className="border-t border-[#333] pt-6">
          <h2 className="text-[16px] font-bold text-white mb-2">
            Cookies
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#999]">
              Manage your cookie preferences
            </p>
            <button className="px-4 py-2 text-[12px] font-semibold text-white bg-transparent border border-[#666] rounded hover:border-white transition-colors">
              Open Cookie Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
