"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Film, Episode } from "@/types";
import { Play, ExternalLink, SkipForward } from "lucide-react";
import { toYoutubeEmbed, getDeviceId } from "@/lib/utils";
import {
  getWatchProgress,
  saveWatchProgress,
  WatchProgress,
} from "@/lib/service";
import Hls from "hls.js";

// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface FilmPlayerProps {
  film: Film;
  onView?: () => void;
}

export default function FilmPlayer({ film, onView }: FilmPlayerProps) {
  const isTVSeries = film.type === "tv";
  const [hasWindow, setHasWindow] = useState(false);
  const [playerType, setPlayerType] = useState<"m3u8" | "webview" | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(
    null
  );
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // Key để force re-render iframe khi có progress
  const [isPlaying, setIsPlaying] = useState(false);
  const deviceId = useRef<string>("");
  const startTimeRef = useRef<number>(0);
  const initialProgressRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const lastActiveTimeRef = useRef<number>(0);

  // lấy quá trình xử lý của tất cả các tập để tìm xem tiếp theo video
  useEffect(() => {
    setHasWindow(true);
    deviceId.current = getDeviceId();

    const loadProgress = async () => {
      if (isTVSeries && film.episodes && film.episodes.length > 0) {
        try {
          const allProgress = await getWatchProgress(deviceId.current, film.id);
          const progressArray = Array.isArray(allProgress)
            ? allProgress
            : allProgress
            ? [allProgress]
            : [];

            // tìm tập tiếp theo chưa xem
          let nextEpisode: Episode | null = null;
          for (const episode of film.episodes) {
            const epProgress = progressArray.find(
              (p) => p.episodeId === episode.id
            );
            if (!epProgress || !epProgress.completed) {
              nextEpisode = episode;
              break;
            }
          }
          // nếu tất cả các tập đã xem, chuyển sang tập đầu tiên
          if (!nextEpisode) {
            nextEpisode = film.episodes[0];
          }

          setSelectedEpisode(nextEpisode);

          const episodeProgresses = progressArray.filter(
            (p) => p.episodeId === nextEpisode?.id && !p.completed
          );
          
          if (episodeProgresses.length > 0) {
            const maxProgress = episodeProgresses.reduce((max, p) => 
              p.currentTime > max.currentTime ? p : max
            );
            setWatchProgress(maxProgress);
            initialProgressRef.current = maxProgress.currentTime;
            setIframeKey((prev) => prev + 1);
          } else {
            initialProgressRef.current = 0;
            setWatchProgress(null);
          }

          // Reset start time khi chọn tập mới
          startTimeRef.current = Date.now();

          // chọn loại player
          if (nextEpisode.linkM3u8) {
            setPlayerType("m3u8");
          } else if (nextEpisode.linkWebview) {
            setPlayerType("webview");
          }
        } catch (error) {
          // nếu lỗi, chuyển sang tập đầu tiên
          const firstEpisode = film.episodes[0];
          setSelectedEpisode(firstEpisode);
          if (firstEpisode.linkM3u8) {
            setPlayerType("m3u8");
          } else if (firstEpisode.linkWebview) {
            setPlayerType("webview");
          }
        }
      } else if (!isTVSeries) {
        // movies, lấy quá trình xử lý
        try {
          const progressArray = await getWatchProgress(deviceId.current, film.id);
          const progress = Array.isArray(progressArray) ? progressArray[0] : null;
          if (progress && !Array.isArray(progress)) {
            if (!progress.completed) {
              setWatchProgress(progress);
              initialProgressRef.current = progress.currentTime;
              setIframeKey((prev) => prev + 1);
            } else {
              initialProgressRef.current = 0;
              setWatchProgress(null);
            }
          } else {
            initialProgressRef.current = 0;
            setWatchProgress(null);
          }
        } catch (error) {
          initialProgressRef.current = 0;
        }

        // Reset start time khi load phim
        startTimeRef.current = Date.now();

        if (film.linkM3u8) setPlayerType("m3u8");
        else if (film.linkWebview) setPlayerType("webview");
      }
    };

    loadProgress();
  }, [film, isTVSeries]);

  const handleEpisodeSelect = async (episode: Episode) => {
    // lưu quá trình xử lý của tập trước khi chuyển tập
    if (selectedEpisode && selectedEpisode.id !== episode.id) {
      await calculateAndSaveProgress();
    }

    // reset trạng thái phát
    startTimeRef.current = Date.now();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setShowNextEpisode(false);

    setSelectedEpisode(episode);

    // chọn loại player
    if (episode.linkM3u8) {
      setPlayerType("m3u8");
    } else if (episode.linkWebview) {
      setPlayerType("webview");
    } else {
      setPlayerType(null);
    }

    // load xử lý tập mới
    try {
      const progress = await getWatchProgress(
        deviceId.current,
        film.id,
        episode.id
      );

      let newProgress: WatchProgress | null = null;
      let resumeTime = 0;

      if (progress) {
        if (Array.isArray(progress)) {
          const episodeProgresses = progress.filter(
            (p) => p.episodeId === episode.id && !p.completed
          );
          
          if (episodeProgresses.length > 0) {
            const maxProgress = episodeProgresses.reduce((max, p) => 
              p.currentTime > max.currentTime ? p : max
            );
            newProgress = maxProgress;
            resumeTime = maxProgress.currentTime;
          } else {
            resumeTime = 0;
          }
        } else {
          if (progress.episodeId === episode.id && !progress.completed) {
            newProgress = progress;
            resumeTime = progress.currentTime;
          } else {
            resumeTime = 0;
          }
        }
      } else {
        resumeTime = 0;
      }

      setWatchProgress(newProgress);
      initialProgressRef.current = resumeTime;
      
      setIframeKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading watch progress:", error);
      setWatchProgress(null);
      initialProgressRef.current = 0;
      setIframeKey((prev) => prev + 1);
    }

    // Reset start time khi chọn tập mới
    startTimeRef.current = Date.now();
  };

  const handleNextEpisode = () => {
    if (!isTVSeries || !film.episodes || !selectedEpisode) {
      return;
    }

    const currentIndex = film.episodes.findIndex(
      (ep) => ep.id === selectedEpisode.id
    );

    if (currentIndex < film.episodes.length - 1) {
      const nextEpisode = film.episodes[currentIndex + 1];
      handleEpisodeSelect(nextEpisode);
    }
  };

  const getNextEpisode = (): Episode | null => {
    if (!isTVSeries || !film.episodes || !selectedEpisode) return null;

    const currentIndex = film.episodes.findIndex(
      (ep) => ep.id === selectedEpisode.id
    );

    if (currentIndex < film.episodes.length - 1) {
      return film.episodes[currentIndex + 1];
    }

    return null;
  };

  // Hàm tính toán và lưu progress update
  const calculateAndSaveProgress = async () => {
    if (!selectedEpisode && isTVSeries) return;

    try {
      let currentTime = 0;
      if (videoRef.current) {
        currentTime = videoRef.current.currentTime;
        initialProgressRef.current = currentTime;
      } else {
        if (isPlayingRef.current && !document.hidden) {
          const now = Date.now();
          const elapsedSeconds = Math.floor(
            (now - startTimeRef.current) / 1000
          );
          const duration = selectedEpisode?.duration
            ? selectedEpisode.duration * 60
            : film.duration
            ? film.duration * 60
            : 3600;
          initialProgressRef.current = Math.min(
            initialProgressRef.current + elapsedSeconds,
            duration
          );
          startTimeRef.current = now;
        }
        currentTime = initialProgressRef.current;
      }

      const duration = selectedEpisode?.duration
        ? selectedEpisode.duration * 60
        : film.duration
        ? film.duration * 60
        : 3600;

      const shouldUpdate = 
        (currentTime > 0 && !watchProgress) ||
        (watchProgress && currentTime >= watchProgress.currentTime && !watchProgress.completed) ||
        (currentTime > 0 && watchProgress && !watchProgress.completed);

      if (!shouldUpdate) {
        return;
      }

      const isCompleted = currentTime / duration >= 0.9;

      await saveWatchProgress(
        deviceId.current,
        film.id,
        isTVSeries ? selectedEpisode?.id : undefined,
        currentTime,
        duration,
        isCompleted
      );

      // Cập nhật watchProgress state
      setWatchProgress((prev) => {
        if (!prev) {
          return {
            id: 0,
            deviceId: deviceId.current,
            filmId: film.id,
            episodeId: isTVSeries ? selectedEpisode?.id : undefined,
            currentTime,
            duration,
            completed: isCompleted,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return {
          ...prev,
          currentTime,
          duration,
          completed: isCompleted ? true : prev.completed,
        };
      });

      // hiển thị nút "Tập tiếp theo" nếu gần hết 90%
      if (isTVSeries && currentTime / duration >= 0.9 && getNextEpisode()) {
        setShowNextEpisode(true);
      }
    } catch (error) {
      console.error("Lỗi xử lý:", error);
    }
  };

  // "Tập tiếp theo"
  useEffect(() => {
    if (!isTVSeries || !selectedEpisode || !videoRef.current) return;

    const video = videoRef.current;
    const checkProgress = () => {
      if (video.duration > 0) {
        const progress = video.currentTime / video.duration;
        if (progress >= 0.9 && getNextEpisode()) {
          setShowNextEpisode(true);
        }
      }
    };

    video.addEventListener("timeupdate", checkProgress);
    return () => video.removeEventListener("timeupdate", checkProgress);
  }, [isTVSeries, selectedEpisode, videoRef.current]);

  useEffect(() => {
    if (!isPlayingRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlayingRef.current) {
          const now = Date.now();
          const elapsedSeconds = Math.floor(
            (now - startTimeRef.current) / 1000
          );

          const duration = selectedEpisode?.duration
            ? selectedEpisode.duration * 60
            : film.duration
            ? film.duration * 60
            : 3600;

          initialProgressRef.current = Math.min(
            initialProgressRef.current + elapsedSeconds,
            duration
          );
          startTimeRef.current = now;
        }
      } else {
        if (isPlayingRef.current) {
          startTimeRef.current = Date.now();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedEpisode, isTVSeries, film]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (isPlayingRef.current && !document.hidden) {
        calculateAndSaveProgress();
      }
    }, 15000); // Lưu mỗi 15 giây

    return () => {
      clearInterval(interval);
    };
  }, [selectedEpisode, isTVSeries, film, isPlaying]);

  // Lưu progress khi component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      calculateAndSaveProgress();
    };

    const handlePageHide = () => {
      calculateAndSaveProgress();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      calculateAndSaveProgress();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [selectedEpisode, isTVSeries, film]);

  useEffect(() => {
    if (watchProgress && watchProgress.completed && isTVSeries) {
      const nextEp = getNextEpisode();
      if (nextEp) {
        const timer = setTimeout(() => {
          handleNextEpisode();
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [watchProgress?.completed, isTVSeries]);

  const getPlayUrl = () => {
    let url: string | null = null;

    if (isTVSeries && selectedEpisode) {
      if (playerType === "m3u8" && selectedEpisode.linkM3u8) {
        url = selectedEpisode.linkM3u8;
      } else if (playerType === "webview" && selectedEpisode.linkWebview) {
        url = selectedEpisode.linkWebview;
      }
    } else {
      if (playerType === "m3u8" && film.linkM3u8) {
        url = film.linkM3u8;
      } else if (playerType === "webview" && film.linkWebview) {
        url = film.linkWebview;
      }
    }

    let resumeTime = 0;
    if (watchProgress) {
      if (isTVSeries && selectedEpisode) {
        if (watchProgress.episodeId === selectedEpisode.id) {
          resumeTime = watchProgress.currentTime;
        }
      } else if (!isTVSeries) {
        if (!watchProgress.episodeId) {
          resumeTime = watchProgress.currentTime;
        }
      }
    }

    if (resumeTime === 0) {
      resumeTime = initialProgressRef.current;
    }

    if (url && playerType === "webview" && resumeTime > 0) {
      url = toYoutubeEmbed(url, resumeTime);
    } else if (url && playerType === "m3u8" && resumeTime > 0) {
      // console.log("Resume time:", resumeTime);
    }

    return url;
  };

  // Tạo playUrl
  const playUrl = useMemo(() => {
    const url = getPlayUrl();
    return url;
  }, [
    watchProgress?.currentTime,
    watchProgress?.episodeId,
    watchProgress?.completed,
    iframeKey,
    playerType,
    selectedEpisode?.id,
    isTVSeries,
    film.id,
    film.linkM3u8,
    film.linkWebview,
  ]);

  // Khởi tạo HLS
  useEffect(() => {

    if (!hasWindow || playerType !== "m3u8" || !playUrl) {
      return;
    }

    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;

    // Tính resumeTime
    let resumeTime = initialProgressRef.current;
    
    if (resumeTime === 0 && watchProgress) {
      if (isTVSeries && selectedEpisode) {
        if (watchProgress.episodeId === selectedEpisode.id) {
          resumeTime = watchProgress.currentTime;
          initialProgressRef.current = resumeTime;
        }
      } else if (!isTVSeries) {
        if (!watchProgress.episodeId) {
          resumeTime = watchProgress.currentTime;
          initialProgressRef.current = resumeTime;
        }
      }
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
      if (resumeTime > 0) {
        let wasPlayingBeforeSeek = false;
        const handleLoadedMetadata = () => {
          wasPlayingBeforeSeek = !video.paused;
          video.currentTime = resumeTime;
          console.log("Thời gian dừng video:", resumeTime);
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
        
        const handleSeeked = () => {
          if (wasPlayingBeforeSeek && video.paused) {
            video.play().catch((err) => {
              console.error("Error resuming play after seek:", err);
            });
          }
          video.removeEventListener("seeked", handleSeeked);
        };
        
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("seeked", handleSeeked);
      }
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.loadSource(playUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (resumeTime > 0) {
          // Lưu trạng thái play trước khi seek
          let wasPlayingBeforeSeek = !video.paused;
          
          const handleSeeked = () => {
            // Sau khi seek xong, nếu video đang play trước đó thì tiếp tục play
            if (wasPlayingBeforeSeek && video.paused) {
              video.play().catch((err) => {
                console.error("Error video play", err);
              });
            }
            video.removeEventListener("seeked", handleSeeked);
          };
          
          video.addEventListener("seeked", handleSeeked);
          // Seek đến thời điểm đã lưu
          video.currentTime = resumeTime;
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // console.error("HLS: lỗi network");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // console.error("HLS: lỗi media");
              hls.recoverMediaError();
              break;
            default:
              // console.error("HLS: lỗi default");
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    } else {
      // console.error("HLS lỗi");
    }
  }, [hasWindow, playerType, playUrl, watchProgress?.currentTime, iframeKey]);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-video bg-black relative">
        {showNextEpisode && getNextEpisode() && (
          <div className="absolute bottom-24 right-4 z-10">
            <button
              onClick={handleNextEpisode}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition"
            >
              <SkipForward className="w-5 h-5" />
              <span>Tập tiếp theo</span>
            </button>
          </div>
        )}

        {hasWindow && playerType === "m3u8" && playUrl ? (
          <video
            key={`m3u8-${iframeKey}`}
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            // onPlay={handlePlay}
            onTimeUpdate={() => {
              if (videoRef.current) {
                const playing = !videoRef.current.paused;
                isPlayingRef.current = playing;
                setIsPlaying(playing);
                if (playing && !document.hidden) {
                  startTimeRef.current = Date.now();
                  lastActiveTimeRef.current = Date.now();
                }
                initialProgressRef.current = videoRef.current.currentTime;
              }
            }}
            onPause={() => {
              isPlayingRef.current = false;
              setIsPlaying(false);
            }}
            onEnded={async () => {
              if (videoRef.current) {
                const duration =
                  videoRef.current.duration ||
                  (selectedEpisode?.duration
                    ? selectedEpisode.duration * 60
                    : film.duration
                    ? film.duration * 60
                    : 3600);
                const shouldUpdate = !watchProgress || duration > watchProgress.currentTime;
                
                if (shouldUpdate) {
                  await saveWatchProgress(
                    deviceId.current,
                    film.id,
                    isTVSeries ? selectedEpisode?.id : undefined,
                    duration,
                    duration,
                    true
                  );
                  setWatchProgress((prev) => {
                    if (!prev) {
                      return {
                        id: 0,
                        deviceId: deviceId.current,
                        filmId: film.id,
                        episodeId: isTVSeries ? selectedEpisode?.id : undefined,
                        currentTime: duration,
                        duration,
                        completed: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                    }
                    return {
                      ...prev,
                      currentTime: duration,
                      duration,
                      completed: true,
                    };
                  });
                }
              }
            }}
            title={
              isTVSeries && selectedEpisode
                ? selectedEpisode.title ||
                  `Tập ${selectedEpisode.episodeNumber}`
                : film.title
            }
          />
        ) : playerType === "webview" && playUrl ? (
          <div className="w-full h-full">
            <iframe
              key={`webview-${iframeKey}`}
              ref={(el) => {
                iframeRef.current = el;
              }}
              src={playUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              loading="lazy"
              // onLoad={handlePlay}
              title={
                isTVSeries && selectedEpisode
                  ? selectedEpisode.title ||
                    `Tập ${selectedEpisode.episodeNumber}`
                  : film.title
              }
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">
                {isTVSeries && !selectedEpisode
                  ? "Vui lòng chọn tập phim"
                  : "Không có link phát video"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-4">
          {((isTVSeries && selectedEpisode?.linkM3u8) ||
            (!isTVSeries && film.linkM3u8)) && (
            <button
              onClick={() => setPlayerType("m3u8")}
              className={`px-4 py-2 rounded ${
                playerType === "m3u8"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Play className="w-4 h-4 inline mr-2" />
              Phát M3U8
            </button>
          )}
          {((isTVSeries && selectedEpisode?.linkWebview) ||
            (!isTVSeries && film.linkWebview)) && (
            <button
              onClick={() => setPlayerType("webview")}
              className={`px-4 py-2 rounded ${
                playerType === "webview"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <ExternalLink className="w-4 h-4 inline mr-2" />
              Phát Webview
            </button>
          )}
        </div>
      </div>
      {isTVSeries && film.episodes && film.episodes.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Chọn tập phim:</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-60 overflow-y-auto">
            {film.episodes.map((episode) => {
              const isWatched =
                watchProgress?.episodeId === episode.id &&
                watchProgress?.completed;

              return (
                <button
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`px-3 py-2 rounded text-sm transition relative ${
                    selectedEpisode?.id === episode.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Tập {episode.episodeNumber}
                  {isWatched && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedEpisode && (
            <div className="mt-3 text-sm text-gray-400">
              {selectedEpisode.title && (
                <p className="font-medium text-white">
                  {selectedEpisode.title}
                </p>
              )}
              {selectedEpisode.description && (
                <p className="mt-1 line-clamp-2">
                  {selectedEpisode.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
