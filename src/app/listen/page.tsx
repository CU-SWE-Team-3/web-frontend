"use client";

import React, { useMemo, useState } from "react";
import {
  Flag,
  Heart,
  ListMusic,
  MoreHorizontal,
  Play,
  Repeat2,
  Share,
  UserPlus,
} from "@/shared/ui";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface SidebarItem {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  countText?: string;
  duration?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

const TrackPage: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [followingArtist, setFollowingArtist] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [baseLikes] = useState(17400);
  const [baseReposts] = useState(1650);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Nour ElDin",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      text: "That bassline at 1:12 is unreal.",
      timestamp: "1 day ago",
    },
    {
      id: "2",
      author: "Mariam Saad",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
      text: "Needed this in my driving playlist.",
      timestamp: "3 days ago",
    },
  ]);

  const playlistItems: SidebarItem[] = [
    {
      id: "p1",
      title: "Electronic Now",
      artist: "SoundCloud Curated",
      artwork:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=160&h=160&fit=crop",
      countText: "32 tracks",
    },
    {
      id: "p2",
      title: "Friday Night Drive",
      artist: "Neon Records",
      artwork:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=160&h=160&fit=crop",
      countText: "18 tracks",
    },
    {
      id: "p3",
      title: "Future Bass Mix",
      artist: "Cloud Waves",
      artwork:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160&h=160&fit=crop",
      countText: "41 tracks",
    },
  ];

  const relatedTracks: SidebarItem[] = [
    {
      id: "r1",
      title: "Night Runner",
      artist: "Aster Peak",
      artwork:
        "https://images.unsplash.com/photo-1461784180009-21121b2f204c?w=160&h=160&fit=crop",
      duration: "3:58",
    },
    {
      id: "r2",
      title: "Neon Pacific",
      artist: "Lina Kai",
      artwork:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=160&h=160&fit=crop",
      duration: "4:12",
    },
    {
      id: "r3",
      title: "Glass Skies",
      artist: "North Drive",
      artwork:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=160&h=160&fit=crop",
      duration: "3:44",
    },
  ];

  const visibleLikes = useMemo(
    () => baseLikes + (liked ? 1 : 0),
    [baseLikes, liked],
  );
  const visibleReposts = useMemo(
    () => baseReposts + (reposted ? 1 : 0),
    [baseReposts, reposted],
  );

  const handleAddComment = () => {
    const value = newComment.trim();
    if (!value) return;

    const comment: Comment = {
      id: String(Date.now()),
      author: "You",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      text: value,
      timestamp: "now",
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setShowCommentInput(false);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-[#333]">
      <header className="bg-[#333] text-white border-b border-black/50">
        <div className="max-w-[1240px] mx-auto h-12 px-4 flex items-center gap-4">
          <div className="h-full w-12 bg-gradient-to-b from-[#ff7a18] to-[#ff5500]" />
          <nav className="hidden md:flex items-center text-sm text-white/90 gap-6">
            <span>Home</span>
            <span>Feed</span>
            <span>Library</span>
          </nav>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for artists, bands, tracks, podcasts"
              className="w-full h-7 rounded-sm border-none bg-white text-[#111] px-3 text-xs outline-none"
            />
          </div>
          <button className="text-xs text-white/90 hidden sm:block">
            Upload
          </button>
          <button className="text-xs text-white/90 hidden sm:block">
            Sign in
          </button>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto bg-white min-h-[calc(100vh-48px)] px-4 sm:px-8 pb-14">
        <section className="pt-6">
          <div className="bg-gradient-to-r from-[#f4b07f] via-[#e58f53] to-[#c7773f] rounded-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <button className="h-14 w-14 shrink-0 rounded-full bg-[#ff5500] hover:bg-[#ff6a1a] transition flex items-center justify-center text-white">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </button>
                  <div>
                    <p className="inline-block bg-black text-white px-2 py-1 text-[11px] leading-none mb-2">
                      Deep House
                    </p>
                    <h1 className="inline-block bg-black text-white px-2 py-1 text-2xl md:text-[34px] leading-tight">
                      Midnight Dreams
                    </h1>
                    <p className="text-white/90 mt-2 text-sm">
                      Luna & The Waves
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="h-16 w-full bg-white/15 border border-white/40 rounded-sm relative overflow-hidden">
                    <div className="absolute inset-0 flex items-end gap-[2px] px-2 pb-2">
                      {Array.from({ length: 110 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-[4px] bg-white/80"
                          style={{ height: `${12 + ((i * 17) % 34)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-white/90 mt-1">
                    <span>0:00</span>
                    <span>4:05</span>
                  </div>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=420&h=420&fit=crop"
                alt="Track artwork"
                className="w-full md:w-[340px] h-[240px] md:h-[340px] object-cover rounded-sm"
              />
            </div>
          </div>
        </section>

        <section className="mt-4 border-b border-[#f0f0f0] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLiked((v) => !v)}
              className={`h-8 px-3 rounded-sm border text-sm flex items-center gap-2 ${
                liked
                  ? "border-[#ff5500] bg-[#fff3ed] text-[#ff5500]"
                  : "border-[#e5e5e5] bg-white text-[#666]"
              }`}
            >
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
              Like
            </button>
            <button
              onClick={() => setReposted((v) => !v)}
              className={`h-8 px-3 rounded-sm border text-sm flex items-center gap-2 ${
                reposted
                  ? "border-[#2ca864] bg-[#eefaf3] text-[#2ca864]"
                  : "border-[#e5e5e5] bg-white text-[#666]"
              }`}
            >
              <Repeat2 size={14} />
              Repost
            </button>
            <button className="h-8 px-3 rounded-sm border border-[#e5e5e5] text-sm text-[#666] flex items-center gap-2">
              <Share size={14} />
              Share
            </button>
            <button className="h-8 px-3 rounded-sm border border-[#e5e5e5] text-sm text-[#666] flex items-center gap-2">
              <Flag size={14} />
              Report
            </button>
            <button className="h-8 w-8 rounded-sm border border-[#e5e5e5] text-[#666] grid place-items-center">
              <MoreHorizontal size={14} />
            </button>

            <div className="ml-auto flex gap-4 text-xs text-[#999]">
              <span>{formatNumber(visibleLikes)} likes</span>
              <span>{formatNumber(visibleReposts)} reposts</span>
              <span>{formatNumber(comments.length)} comments</span>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <main>
            <section className="flex items-start gap-4 pb-6 border-b border-[#f0f0f0]">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&h=120&fit=crop"
                alt="Artist avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-[#999]">Luna & The Waves</p>
                <button
                  onClick={() => setFollowingArtist((v) => !v)}
                  className={`mt-2 h-7 px-3 text-xs rounded-sm border flex items-center gap-1 ${
                    followingArtist
                      ? "border-[#e5e5e5] text-[#666]"
                      : "border-[#ff5500] bg-[#ff5500] text-white"
                  }`}
                >
                  <UserPlus size={12} />
                  {followingArtist ? "Following" : "Follow"}
                </button>
                <p className="mt-3 text-sm text-[#444] max-w-[680px] leading-6">
                  New single from our upcoming EP. Built from analog synth
                  layers and chopped vocal textures, this version is the
                  original full mix.
                </p>
              </div>
            </section>

            <section className="mt-6">
              <div className="text-sm text-[#999] mb-3">
                {comments.length} comments
              </div>

              {!showCommentInput ? (
                <button
                  onClick={() => setShowCommentInput(true)}
                  className="w-full h-10 rounded-sm border border-[#e5e5e5] text-left px-3 text-sm text-[#999]"
                >
                  Write a comment
                </button>
              ) : (
                <div className="border border-[#e5e5e5] rounded-sm p-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment"
                    className="w-full min-h-[84px] border border-[#eee] rounded-sm p-2 text-sm outline-none"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowCommentInput(false);
                        setNewComment("");
                      }}
                      className="h-8 px-3 border border-[#e5e5e5] rounded-sm text-sm text-[#666]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="h-8 px-3 rounded-sm bg-[#ff5500] text-white text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-5">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 border-b border-[#f5f5f5] pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#333]">{comment.author}</p>
                        <p className="text-xs text-[#999]">
                          {comment.timestamp}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-[#555]">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside>
            <section>
              <h3 className="text-[13px] uppercase tracking-wide text-[#999] mb-3 flex items-center gap-2">
                <ListMusic size={14} />
                In playlists
              </h3>
              <div className="space-y-3">
                {playlistItems.map((item) => (
                  <article key={item.id} className="flex gap-3 items-center">
                    <img
                      src={item.artwork}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-[#333] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#999] truncate">
                        {item.artist}
                      </p>
                      <p className="text-xs text-[#999]">{item.countText}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-[13px] uppercase tracking-wide text-[#999] mb-3">
                Related tracks
              </h3>
              <div className="space-y-3">
                {relatedTracks.map((item) => (
                  <article key={item.id} className="flex gap-3 items-center">
                    <img
                      src={item.artwork}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#333] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#999] truncate">
                        {item.artist}
                      </p>
                    </div>
                    <div className="text-xs text-[#999]">{item.duration}</div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
