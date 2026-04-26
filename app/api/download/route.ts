import { NextRequest, NextResponse } from 'next/server';
import { downloadVideo, downloadAudio, createZipFromFiles, downloadPlaylist, moveFile } from '@/lib/ytdlp';
import { addTask, updateTask, broadcastProgress } from '@/lib/websocket';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, type, format, isPlaylist, playlistLimit } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const taskId = uuidv4();

    if (isPlaylist) {
      // Handle playlist download
      const playlistTask = {
        id: taskId,
        url,
        title: 'Playlist Download',
        videos: [],
        status: 'queued' as const,
        overallProgress: 0,
        completedCount: 0,
        totalCount: 0,
      };

      addTask(playlistTask);

      // Process playlist asynchronously
      processPlaylistDownload(playlistTask, type, format, playlistLimit).catch(console.error);

      return NextResponse.json({ taskId, type: 'playlist' });
    } else {
      // Handle single video download
      const task = {
        id: taskId,
        url,
        title: '',
        type: type as 'video' | 'audio',
        format,
        status: 'queued' as const,
        progress: 0,
      };

      addTask(task);

      // Process download asynchronously
      processSingleDownload(task, type, format).catch(console.error);

      return NextResponse.json({ taskId, type: 'single' });
    }
  } catch (error: any) {
    console.error('Error starting download:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start download' },
      { status: 500 }
    );
  }
}

async function processSingleDownload(
  task: any,
  type: string,
  format?: string
) {
  try {
    updateTask(task.id, { status: 'downloading' });

    let result;
    if (type === 'audio') {
      result = await downloadAudio(task.url, (progress) => {
        updateTask(task.id, {
          progress: progress.progress,
          title: progress.videoTitle || task.title,
        });
        broadcastProgress(progress);
      });
    } else {
      result = await downloadVideo(task.url, format || 'best', (progress) => {
        updateTask(task.id, {
          progress: progress.progress,
          title: progress.videoTitle || task.title,
        });
        broadcastProgress(progress);
      });
    }

    // Move file to downloads directory
    const finalPath = path.join(
      process.cwd(),
      'downloads',
      path.basename(result.filePath)
    );
    moveFile(result.filePath, finalPath);

    updateTask(task.id, {
      status: 'completed',
      progress: 100,
      filePath: finalPath,
      title: result.title,
    });
  } catch (error: any) {
    console.error('Download failed:', error);
    updateTask(task.id, {
      status: 'error',
      error: error.message,
    });
  }
}

async function processPlaylistDownload(
  task: any,
  type: string,
  format?: string,
  playlistLimit?: number
) {
  try {
    updateTask(task.id, { status: 'downloading' });

    const result = await downloadPlaylist(
      task.url,
      type as 'video' | 'audio',
      format,
      playlistLimit,
      (progress) => {
        updateTask(task.id, {
          overallProgress: (progress.current / progress.total) * 100,
          completedCount: progress.current,
          totalCount: progress.total,
        });
      }
    );

    // Create zip file
    const zipPath = path.join(
      process.cwd(),
      'downloads',
      `playlist_${Date.now()}.zip`
    );

    await createZipFromFiles(result.files, zipPath);

    updateTask(task.id, {
      status: 'completed',
      overallProgress: 100,
      completedCount: result.files.length,
      totalCount: result.files.length,
      zipPath,
    });

    // Cleanup temp files
    for (const file of result.files) {
      try {
        fs.unlinkSync(file.filePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error: any) {
    console.error('Playlist download failed:', error);
    updateTask(task.id, {
      status: 'error',
      error: error.message,
    });
  }
}
