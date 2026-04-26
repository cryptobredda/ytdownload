'use client';

import { VideoInfo } from '@/lib/types';

interface VideoPreviewProps {
  videoInfo: VideoInfo;
}

export default function VideoPreview({ videoInfo }: VideoPreviewProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="bg-[#1f1f1f] rounded-xl border border-[#303030] overflow-hidden">
      {/* Video Embed */}
      {!videoInfo.isPlaylist && (
        <div className="relative pb-[56.25%] h-0 bg-[#0f0f0f]">
          <iframe
            title={videoInfo.title}
            src={getYouTubeEmbedUrl(videoInfo.id)}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h2 className="text-base font-semibold text-white mb-3 line-clamp-2">
          {videoInfo.title}
        </h2>

        <div className="flex items-center gap-4 text-sm text-[#aaaaaa]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <title>Channel</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{videoInfo.uploader}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <title>Duration</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {videoInfo.isPlaylist
                ? `${videoInfo.playlistCount} videos`
                : formatDuration(videoInfo.duration)
              }
            </span>
          </div>
        </div>

        {/* Playlist Entries */}
        {videoInfo.isPlaylist && videoInfo.entries && (
          <div className="mt-4 pt-4 border-t border-[#303030]">
            <div className="max-h-72 overflow-y-auto space-y-1 -mx-1 px-1">
              {videoInfo.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#272727] transition-colors group"
                >
                  <span className="text-[#888] text-xs w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative w-24 h-14 rounded-md overflow-hidden bg-[#272727] shrink-0">
                    <img
                      src={entry.thumbnail}
                      alt={entry.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {entry.duration > 0 && (
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                        {formatDuration(entry.duration)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2 group-hover:text-white">
                      {entry.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
