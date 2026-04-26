import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Try multiple ways to find yt-dlp
function getYtDlpCommand(): string {
  // Try different possible commands
  return 'yt-dlp';
}

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
}

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');
const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure directories exist
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const isPlaylist = url.includes('playlist') || url.includes('list=');
  
  const { stdout } = await execAsync(
    `yt-dlp --dump-json --no-playlist "${url}"`,
    { maxBuffer: 50 * 1024 * 1024 }
  );
  
  const data = JSON.parse(stdout);
  
  // Get available formats
  const formats = data.formats
    .filter((f: any) => f.vcodec !== 'none' || f.acodec !== 'none')
    .map((f: any) => ({
      format_id: f.format_id,
      ext: f.ext,
      resolution: f.resolution || 'audio only',
      filesize: f.filesize,
      vcodec: f.vcodec,
      acodec: f.acodec,
      fps: f.fps,
      format_note: f.format_note,
    }));

  const info: VideoInfo = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader || 'Unknown',
    formats: getUniqueResolutions(formats),
    isPlaylist: false,
  };

  // If it's a playlist, get the count
  if (url.includes('list=')) {
    try {
      const { stdout: playlistStd } = await execAsync(
        `yt-dlp --dump-json --flat-playlist --playlist-items 1 "${url}"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      const playlistData = JSON.parse(playlistStd);
      
      const { stdout: fullStd } = await execAsync(
        `yt-dlp --dump-json --flat-playlist --playlist-end 100 "${url}"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      
      // Count entries from flat playlist
      const entries = fullStd.trim().split('\n');
      info.isPlaylist = true;
      info.playlistCount = entries.length;
      info.entries = entries.map((entry: string) => {
        const d = JSON.parse(entry);
        return {
          id: d.id,
          title: d.title,
          thumbnail: `https://i.ytimg.com/vi/${d.id}/hqdefault.jpg`,
          duration: d.duration || 0,
          uploader: '',
          formats: [],
          isPlaylist: false,
        };
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  }

  return info;
}

function getUniqueResolutions(formats: VideoFormat[]): VideoFormat[] {
  const seen = new Set<string>();
  return formats
    .filter((f) => f.resolution !== 'audio only')
    .filter((f) => {
      if (seen.has(f.resolution)) return false;
      seen.add(f.resolution);
      return true;
    })
    .sort((a, b) => {
      const resA = parseInt(a.resolution) || 0;
      const resB = parseInt(b.resolution) || 0;
      return resB - resA;
    });
}

export async function downloadVideo(
  url: string,
  format: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ filePath: string; title: string }> {
  const taskId = uuidv4();
  const outputPath = path.join(TEMP_DIR, `${taskId}.%(ext)s`);
  
  return new Promise((resolve, reject) => {
    const args = [
      '-f', format,
      '--merge-output-format', 'mp4',
      '--newline',
      '--remote-components', 'ejs:github',
      '-o', outputPath,
      '--no-playlist',
      '--progress',
      url,
    ];

    const process = spawn('yt-dlp', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let title = '';

    process.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Extract title
      if (output.includes('[download] Destination:') || output.includes('[Merger]')) {
        const titleMatch = output.match(/\[download\] Destination: (.+)/);
        if (titleMatch) {
          title = path.basename(titleMatch[1], path.extname(titleMatch[1]));
        }
      }

      // Parse progress
      const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%.*?at\s+([^\s]+).*?ETA\s+([^\s]+)/);
      if (progressMatch && onProgress) {
        onProgress({
          videoId: taskId,
          videoTitle: title,
          progress: parseFloat(progressMatch[1]),
          speed: progressMatch[2],
          eta: progressMatch[3],
          status: 'downloading',
        });
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        // Find the downloaded file
        const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(taskId));
        if (files.length > 0) {
          const filePath = path.join(TEMP_DIR, files[0]);
          resolve({ filePath, title: title || taskId });
        } else {
          reject(new Error('Download completed but file not found'));
        }
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

export async function downloadAudio(
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ filePath: string; title: string }> {
  const taskId = uuidv4();
  const outputPath = path.join(TEMP_DIR, `${taskId}.%(ext)s`);
  
  return new Promise((resolve, reject) => {
    const args = [
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--newline',
      '--remote-components', 'ejs:github',
      '-o', outputPath,
      '--no-playlist',
      url,
    ];

    const process = spawn('yt-dlp', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let title = '';

    process.stderr.on('data', (data) => {
      const output = data.toString();
      
      const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
      if (progressMatch && onProgress) {
        onProgress({
          videoId: taskId,
          videoTitle: title,
          progress: parseFloat(progressMatch[1]),
          speed: 'N/A',
          eta: 'N/A',
          status: 'converting',
        });
      }
    });

    process.stdout.on('data', (data) => {
      const output = data.toString();
      const destMatch = output.match(/\[download\] Destination: (.+)/);
      if (destMatch) {
        title = path.basename(destMatch[1], path.extname(destMatch[1]));
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(taskId));
        if (files.length > 0) {
          const filePath = path.join(TEMP_DIR, files[0]);
          resolve({ filePath, title: title || taskId });
        } else {
          reject(new Error('Download completed but file not found'));
        }
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

export async function downloadPlaylist(
  url: string,
  type: 'video' | 'audio',
  format?: string,
  playlistLimit?: number,
  onProgress?: (progress: { current: number; total: number; videoTitle: string; videoProgress: number }) => void
): Promise<{ files: { filePath: string; title: string }[] }> {
  const playlistId = uuidv4();
  const outputDir = path.join(TEMP_DIR, `playlist_${playlistId}`);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const args: string[] = [];

    if (type === 'audio') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else if (format) {
      args.push('-f', format, '--merge-output-format', 'mp4');
    }

    args.push(
      '--newline',
      '--progress',
      '--remote-components', 'ejs:github',
    );

    if (playlistLimit && playlistLimit > 0) {
      args.push('--playlist-end', String(playlistLimit));
    }

    args.push(
      '-o', path.join(outputDir, '%(playlist_index)s.%(title)s.%(ext)s'),
      '--yes-playlist',
      url,
    );

    const process = spawn('yt-dlp', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const files: { filePath: string; title: string }[] = [];
    let total = 0;
    let current = 0;
    let currentTitle = '';

    const parseProgress = (output: string) => {
      const downloadMatch = output.match(/\[download\] Downloading (?:video|item) (\d+) of (\d+)/);
      if (downloadMatch) {
        current = parseInt(downloadMatch[1]);
        total = parseInt(downloadMatch[2]);
      }
      const destMatch = output.match(/\[download\] Destination: (.+)/);
      if (destMatch) {
        currentTitle = path.basename(destMatch[1], path.extname(destMatch[1]));
      }
      const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
      const videoProgress = progressMatch ? parseFloat(progressMatch[1]) : 0;
      if (onProgress && total > 0) {
        onProgress({ current, total, videoTitle: currentTitle, videoProgress });
      }
    };

    process.stdout.on('data', (data) => { parseProgress(data.toString()); });
    process.stderr.on('data', (data) => { parseProgress(data.toString()); });

    process.on('close', async (code) => {
      if (code === 0) {
        const downloadedFiles = fs.readdirSync(outputDir);
        for (const file of downloadedFiles) {
          files.push({
            filePath: path.join(outputDir, file),
            title: file,
          });
        }
        resolve({ files });
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

export function createZipFromFiles(
  files: { filePath: string; title: string }[],
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = require('archiver')('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve(outputPath);
    });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    archive.pipe(output);

    for (const file of files) {
      archive.file(file.filePath, { name: sanitizeFilename(file.title) });
    }

    archive.finalize();
  });
}

export function moveFile(src: string, dest: string): void {
  try {
    fs.renameSync(src, dest);
  } catch (err: any) {
    if (err.code === 'EXDEV') {
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
    } else {
      throw err;
    }
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

export function cleanupTempFiles(taskId: string): void {
  const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(taskId));
  for (const file of files) {
    fs.unlinkSync(path.join(TEMP_DIR, file));
  }
}

export function getDownloadsDir(): string {
  return DOWNLOADS_DIR;
}

export function getTempDir(): string {
  return TEMP_DIR;
}
