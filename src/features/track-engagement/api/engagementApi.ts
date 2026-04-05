import apiClient from '@/shared/api/client';

export const likeTrack = async (trackId: string): Promise<void> => {
  await apiClient.post(`/tracks/${trackId}/like`);
};

export const unlikeTrack = async (trackId: string): Promise<void> => {
  await apiClient.delete(`/tracks/${trackId}/like`);
};

export const getTrackLikers = async (trackId: string): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/likers`);
  return data.data; // Assuming standardized envelope
};

export const getTrackReposters = async (trackId: string): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/reposters`);
  return data.data;
};

export const repostTrack = async (trackId: string): Promise<void> => {
  await apiClient.post(`/tracks/${trackId}/repost`);
};

export const unrepostTrack = async (trackId: string): Promise<void> => {
  await apiClient.delete(`/tracks/${trackId}/repost`);
};

export const getTrackPlaylists = async (trackId: string): Promise<any[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/playlists`);
  return data.data;
};
