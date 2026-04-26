export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats: VideoFormat[];
  isPlaylist: boolean;
  playlistCount?: number;
  entries?: VideoInfo[];
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  fps?: number;
  format_note?: string;
}

export interface DownloadProgress {
  videoId: string;
  videoTitle: string;
  progress: number;
  speed: string;
  eta: string;
  status: 'downloading' | 'converting' | 'completed' | 'error';
  error?: string;
}

export interface DownloadTask {
  id: string;
  url: string;
  title: string;
  type: 'video' | 'audio';
  format?: string;
  status: 'queued' | 'downloading' | 'completed' | 'error';
  progress: number;
  filePath?: string;
  error?: string;
}

export interface PlaylistDownloadTask {
  id: string;
  url: string;
  title: string;
  videos: DownloadTask[];
  status: 'queued' | 'downloading' | 'completed' | 'error';
  overallProgress: number;
  completedCount: number;
  totalCount: number;
  zipPath?: string;
  error?: string;
}
