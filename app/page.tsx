'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import VideoPreview from '@/components/VideoPreview';
import DownloadTasks from '@/components/DownloadTasks';
import { VideoInfo, DownloadTask, PlaylistDownloadTask } from '@/lib/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('best');
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [tasks, setTasks] = useState<(DownloadTask | PlaylistDownloadTask)[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [playlistLimit, setPlaylistLimit] = useState<number>(0);
  const [hasCookies, setHasCookies] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [uploadingCookies, setUploadingCookies] = useState(false);
  const cookiesInputRef = useRef<HTMLInputElement>(null);

  const checkCookies = useCallback(async () => {
    try {
      const res = await fetch('/api/cookies');
      if (res.ok) {
        const data = await res.json();
        setHasCookies(data.hasCookies);
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkCookies();
  }, [checkCookies]);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'tasks_update') {
          setTasks(data.tasks);
        }
      };
    } catch (error) {
      // WebSocket optional
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks);
        }
      } catch (error) {
        // Silently fail
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, []);

  const fetchVideoInfo = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);
    setPlaylistLimit(0);

    try {
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch video info');
      }

      const data = await response.json();
      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const startDownload = useCallback(async () => {
    if (!videoInfo || downloading) return;

    setDownloading(true);
    setError('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          type: downloadType,
          format: selectedFormat,
          isPlaylist: videoInfo.isPlaylist,
          playlistLimit: videoInfo.isPlaylist ? playlistLimit : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start download');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }, [videoInfo, url, downloadType, selectedFormat, downloading, playlistLimit]);

  const getLimitOptions = (totalCount: number): number[] => {
    const presets = [10, 25, 50, 75, 100, 150, 200, 250, 300, 500];
    return presets.filter((p) => p < totalCount);
  };

  const uploadCookies = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCookies(true);
    try {
      const formData = new FormData();
      formData.append('cookies', file);
      const res = await fetch('/api/cookies', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHasCookies(true);
      setShowCookies(false);
    } catch (err: any) {
      alert(err.message || 'Failed to upload cookies');
    } finally {
      setUploadingCookies(false);
      if (cookiesInputRef.current) cookiesInputRef.current.value = '';
    }
  };

  const deleteCookies = async () => {
    await fetch('/api/cookies', { method: 'DELETE' });
    setHasCookies(false);
    setShowCookies(false);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#ff0000] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <title>YTD Logo</title>
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">YTD</span>
          </div>

          <div className="flex-1" />

          {/* Cookies */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCookies(!showCookies)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                hasCookies
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-[#272727] text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <title>Cookies</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {hasCookies ? 'Authenticated' : 'Cookies'}
            </button>

            {showCookies && (
              <>
                <div className="fixed inset-0 z-40" onKeyUp={() => {}} onKeyDown={() => setShowCookies(false)} role="button" tabIndex={-1} onClick={() => setShowCookies(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1f1f1f] border border-[#303030] rounded-xl p-4 z-50 shadow-xl">
                  <p className="text-sm text-white font-medium mb-3">YouTube Authentication</p>

                  {hasCookies ? (
                    <>
                      <p className="text-xs text-[#888] mb-4 leading-relaxed">
                        Cookies are active. Downloads will use your YouTube session. Cookies last a long time but may need to be re-uploaded if downloads start failing.
                      </p>
                      <button
                        type="button"
                        onClick={deleteCookies}
                        className="w-full h-8 bg-[#272727] hover:bg-[#3f3f3f] text-[#ff6b6b] rounded-lg text-xs font-medium transition-colors"
                      >
                        Remove Cookies
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-[#888] leading-relaxed mb-4 space-y-2">
                        <p>Required when running on a server IP. You need to export cookies from a browser where you're <strong className="text-white">logged into YouTube</strong>.</p>
                        <ol className="list-decimal list-inside space-y-1.5 text-[#aaaaaa]">
                          <li>Install <strong className="text-white">"Get cookies.txt LOCALLY"</strong> browser extension</li>
                          <li>Make sure you're logged into YouTube in that browser</li>
                          <li>Click the extension on any YouTube page and export</li>
                          <li>Upload the <code className="text-white bg-[#272727] px-1 rounded">cookies.txt</code> file below</li>
                        </ol>
                      </div>

                      <input
                        ref={cookiesInputRef}
                        type="file"
                        accept=".txt"
                        onChange={uploadCookies}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => cookiesInputRef.current?.click()}
                        disabled={uploadingCookies}
                        className="w-full h-8 bg-[#272727] hover:bg-[#3f3f3f] text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {uploadingCookies ? 'Uploading...' : 'Upload cookies.txt'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Download YouTube Videos
          </h1>
          <p className="text-[#aaaaaa] text-base">
            Fast, free downloads for videos and playlists
          </p>
        </div>

        {/* URL Input */}
        <div className="flex gap-3 mb-10">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL..."
              className="w-full h-11 bg-[#1f1f1f] border border-[#303030] rounded-full px-5 pr-4 text-sm text-white placeholder-[#888] focus:outline-none focus:border-[#aaaaaa] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && fetchVideoInfo()}
            />
          </div>
          <button
            onClick={fetchVideoInfo}
            disabled={loading}
            type="button"
            className="h-11 px-6 bg-[#f1f1f1] hover:bg-white text-[#0f0f0f] rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <title>Loading</title>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Fetching...
              </>
            ) : (
              'Fetch'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[#ff0000]/10 border border-[#ff0000]/30 rounded-xl text-sm text-[#ff6b6b]">
            {error}
          </div>
        )}

        {/* Video Preview & Options */}
        {videoInfo && (
          <div className="mb-10">
            <VideoPreview videoInfo={videoInfo} />

            {/* Download Options */}
            <div className="mt-6 bg-[#1f1f1f] rounded-xl border border-[#303030] p-6">
              <h3 className="text-base font-semibold text-white mb-5">Download Options</h3>

              {/* Type Toggle */}
              <div className="mb-5">
                <span className="block text-xs font-medium text-[#aaaaaa] uppercase tracking-wide mb-3">
                  Format
                </span>
                <div className="flex bg-[#272727] rounded-lg p-1">
                  <button
                    onClick={() => setDownloadType('video')}
                    type="button"
                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-all ${
                      downloadType === 'video'
                        ? 'bg-[#3f3f3f] text-white'
                        : 'text-[#aaaaaa] hover:text-white'
                    }`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => setDownloadType('audio')}
                    type="button"
                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-all ${
                      downloadType === 'audio'
                        ? 'bg-[#3f3f3f] text-white'
                        : 'text-[#aaaaaa] hover:text-white'
                    }`}
                  >
                    Audio Only
                  </button>
                </div>
              </div>

              {/* Resolution */}
              {downloadType === 'video' && videoInfo.formats.length > 0 && (
                <div className="mb-5">
                  <label htmlFor="quality-select" className="block text-xs font-medium text-[#aaaaaa] uppercase tracking-wide mb-3">
                    Quality
                  </label>
                  <select
                    id="quality-select"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full h-10 bg-[#272727] border border-[#303030] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#aaaaaa] transition-colors"
                  >
                    <option value="best">Best Available</option>
                    {videoInfo.formats.map((format) => (
                      <option key={format.format_id} value={format.format_id}>
                        {format.resolution}
                        {format.format_note ? ` — ${format.format_note}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Playlist Limit */}
              {videoInfo.isPlaylist && videoInfo.playlistCount && videoInfo.playlistCount > 0 && (
                <div className="mb-5">
                  <label htmlFor="playlist-limit" className="block text-xs font-medium text-[#aaaaaa] uppercase tracking-wide mb-3">
                    Videos to Download
                  </label>
                  <select
                    id="playlist-limit"
                    value={playlistLimit}
                    onChange={(e) => setPlaylistLimit(Number(e.target.value))}
                    className="w-full h-10 bg-[#272727] border border-[#303030] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#aaaaaa] transition-colors"
                  >
                    <option value={0}>All videos ({videoInfo.playlistCount})</option>
                    {getLimitOptions(videoInfo.playlistCount).map((limit) => (
                      <option key={limit} value={limit}>
                        First {limit} videos
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Playlist Info */}
              {videoInfo.isPlaylist && (
                <div className="mb-5 flex items-center gap-2 text-sm text-[#aaaaaa]">
                  <svg className="w-4 h-4 text-[#aaaaaa] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <title>Playlist</title>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>
                    {videoInfo.isPlaylist
                      ? `${playlistLimit > 0 ? playlistLimit : videoInfo.playlistCount} videos will be downloaded as a ZIP file`
                      : 'Single video download'}
                  </span>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={startDownload}
                disabled={downloading}
                type="button"
                className="w-full h-11 bg-[#cc0000] hover:bg-[#ff0000] text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <title>Loading</title>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <title>Download</title>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {videoInfo.isPlaylist ? 'Download Playlist' : 'Download'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Active Downloads */}
        <DownloadTasks tasks={tasks} />
      </div>
    </main>
  );
}
