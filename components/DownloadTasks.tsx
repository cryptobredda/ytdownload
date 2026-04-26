'use client';

import { DownloadTask, PlaylistDownloadTask } from '@/lib/types';

interface DownloadTasksProps {
  tasks: (DownloadTask | PlaylistDownloadTask)[];
}

export default function DownloadTasks({ tasks }: DownloadTasksProps) {
  const activeTasks = tasks.filter(t => t.status === 'downloading' || t.status === 'queued');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const errorTasks = tasks.filter(t => t.status === 'error');

  const handleDownload = (filePath: string) => {
    window.location.href = `/api/download-file?path=${encodeURIComponent(filePath)}`;
  };

  const isPlaylistTask = (task: DownloadTask | PlaylistDownloadTask): task is PlaylistDownloadTask => {
    return 'overallProgress' in task;
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Active Downloads */}
      {activeTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#aaaaaa] uppercase tracking-wide mb-3">
            Active Downloads
          </h3>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#1f1f1f] rounded-xl border border-[#303030] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {task.title || 'Downloading...'}
                    </p>
                    <p className="text-xs text-[#888] mt-0.5">
                      {isPlaylistTask(task)
                        ? `${task.completedCount} of ${task.totalCount} videos`
                        : task.type === 'audio'
                        ? 'Audio (MP3)'
                        : 'Video (MP4)'}
                    </p>
                  </div>
                  <span className="ml-3 text-xs font-medium text-[#aaaaaa] bg-[#272727] px-2.5 py-1 rounded-full shrink-0">
                    {task.status === 'queued' ? 'Queued' : 'Downloading'}
                  </span>
                </div>

                <div className="w-full bg-[#272727] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#cc0000] transition-all duration-500 ease-out"
                    style={{
                      width: `${isPlaylistTask(task) ? task.overallProgress : task.progress}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#888]">
                    {isPlaylistTask(task)
                      ? `${Math.round(task.overallProgress)}%`
                      : `${Math.round(task.progress)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Downloads */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#aaaaaa] uppercase tracking-wide mb-3">
            Completed
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#1f1f1f] rounded-xl border border-[#303030] p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{task.title}</p>
                  <p className="text-xs text-[#888] mt-0.5">
                    {isPlaylistTask(task)
                      ? `${task.completedCount} videos (ZIP)`
                      : task.type === 'audio'
                      ? 'Audio (MP3)'
                      : 'Video (MP4)'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const filePath = isPlaylistTask(task) ? task.zipPath : task.filePath;
                    if (filePath) handleDownload(filePath);
                  }}
                  type="button"
                  className="ml-4 h-8 px-4 bg-[#272727] hover:bg-[#3f3f3f] text-white rounded-full text-xs font-medium transition-colors flex items-center gap-2 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <title>Download</title>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Downloads */}
      {errorTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#aaaaaa] uppercase tracking-wide mb-3">
            Failed
          </h3>
          <div className="space-y-3">
            {errorTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#1f1f1f] rounded-xl border border-[#ff0000]/30 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{task.title || 'Download Failed'}</p>
                    <p className="text-xs text-[#ff6b6b] mt-1">{task.error}</p>
                  </div>
                  <span className="ml-3 text-xs font-medium text-[#ff6b6b] bg-[#ff0000]/10 px-2.5 py-1 rounded-full shrink-0">
                    Failed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
