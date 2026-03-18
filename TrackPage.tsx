import React, { useState } from "react";
import {
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Play,
  MoreHorizontal,
} from "lucide-react";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  avatar: string;
  waveformUrl: string;
  duration: number;
  plays: number;
  likes: number;
  reposts: number;
  comments: number;
  description: string;
}

const TrackPage: React.FC = () => {
  // Sample track data
  const [track, setTrack] = useState<Track>({
    id: "1",
    title: "Midnight Dreams",
    artist: "Luna & The Waves",
    avatar:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
    waveformUrl: "https://via.placeholder.com/800x100",
    duration: 245,
    plays: 15420,
    likes: 892,
    reposts: 234,
    comments: 45,
    description:
      "A dreamy electronic track perfect for late-night vibes. Enjoy this ambient journey through space and time.",
  });

  // Sample comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Alex Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      text: "This track is absolutely amazing! The production quality is incredible.",
      timestamp: "2 weeks ago",
      likes: 42,
      liked: false,
    },
    {
      id: "2",
      author: "Jordan Martinez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      text: "Been listening to this on repeat. Would love to collaborate with you!",
      timestamp: "1 week ago",
      likes: 28,
      liked: false,
    },
    {
      id: "3",
      author: "Sam Taylor",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      text: "The drop at 2:30 is chef's kiss 👨‍🍳",
      timestamp: "3 days ago",
      likes: 156,
      liked: false,
    },
  ]);

  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setLiked(!liked);
    setTrack((prev) => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleRepost = () => {
    setReposted(!reposted);
    setTrack((prev) => ({
      ...prev,
      reposts: reposted ? prev.reposts - 1 : prev.reposts + 1,
    }));
  };

  const handleCommentLike = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: String(comments.length + 1),
        author: "Your Name",
        avatar:
          "https://images.unsplash.com/photo-1535713566543-ba1e5a0b35c1?w=150&h=150&fit=crop",
        text: newComment,
        timestamp: "now",
        likes: 0,
        liked: false,
      };
      setComments([comment, ...comments]);
      setNewComment("");
      setShowCommentInput(false);
      setTrack((prev) => ({
        ...prev,
        comments: prev.comments + 1,
      }));
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">Tracks</h1>
          <button className="text-slate-400 hover:text-white transition">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Track Header */}
        <div className="mb-8">
          <div className="flex gap-6 mb-8">
            <img
              src={track.avatar}
              alt={track.artist}
              className="w-32 h-32 rounded-lg shadow-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Artist</p>
                  <h2 className="text-white text-4xl font-bold mb-2">
                    {track.title}
                  </h2>
                  <p className="text-slate-300 text-lg">{track.artist}</p>
                </div>
              </div>
              <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-3 font-semibold flex items-center gap-2 transition">
                <Play size={20} fill="currentColor" />
                Play
              </button>
            </div>
          </div>

          {/* Waveform */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl">
            <img
              src={track.waveformUrl}
              alt="Waveform"
              className="w-full h-24 rounded"
            />
            <div className="flex justify-between text-slate-400 text-xs mt-3">
              <span>0:00</span>
              <span>{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Plays</p>
              <p className="text-white text-2xl font-bold">
                {formatNumber(track.plays)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Likes</p>
              <p className="text-white text-2xl font-bold">
                {formatNumber(track.likes)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Reposts</p>
              <p className="text-white text-2xl font-bold">
                {formatNumber(track.reposts)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Comments</p>
              <p className="text-white text-2xl font-bold">
                {formatNumber(track.comments)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                liked
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
              Like
            </button>
            <button
              onClick={handleRepost}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                reposted
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <Repeat2 size={20} />
              Repost
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-full font-semibold hover:bg-slate-600 transition">
              <Share size={20} />
              Share
            </button>
          </div>

          {/* Description */}
          <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
            <p className="text-slate-300">{track.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex items-center gap-2 mb-8">
            <MessageCircle size={24} className="text-slate-300" />
            <h3 className="text-white text-2xl font-bold">Comments</h3>
            <span className="text-slate-400 text-sm ml-auto">
              {comments.length}
            </span>
          </div>

          {/* Comment Input */}
          <div className="mb-8">
            {!showCommentInput ? (
              <button
                onClick={() => setShowCommentInput(true)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left transition"
              >
                Add a comment...
              </button>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex gap-4 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1535713566543-ba1e5a0b35c1?w=150&h=150&fit=crop"
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What do you think?"
                    className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowCommentInput(false);
                      setNewComment("");
                    }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-4 pb-6 border-b border-slate-700"
              >
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">
                        {comment.author}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {comment.timestamp}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-3 leading-relaxed">
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center gap-1 text-sm transition ${
                        comment.liked
                          ? "text-red-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={comment.liked ? "currentColor" : "none"}
                      />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-slate-500 hover:text-slate-300 text-sm transition">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
