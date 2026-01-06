"use client";

import { useState, useEffect } from "react";
import { Film, Episode } from "@/types";
import { Play, ExternalLink } from "lucide-react";
import { toYoutubeEmbed } from "@/lib/utils";

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

  useEffect(() => {
    setHasWindow(true);
  
    if (
      isTVSeries &&
      film.episodes &&
      film.episodes.length > 0 &&
      !selectedEpisode
    ) {
      const firstEpisode = film.episodes[0];
      setSelectedEpisode(firstEpisode);
  
      if (firstEpisode.linkM3u8) {
        setPlayerType("m3u8");
      } else if (firstEpisode.linkWebview) {
        setPlayerType("webview");
      }
    } else if (!isTVSeries) {
      if (film.linkM3u8) setPlayerType("m3u8");
      else if (film.linkWebview) setPlayerType("webview");
    }
  }, [film, isTVSeries, selectedEpisode]);
  

  const handlePlay = () => {
    if (onView) {
      onView();
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode);
    if (episode.linkM3u8) {
      setPlayerType("m3u8");
    } else if (episode.linkWebview) {
      setPlayerType("webview");
    } else {
      setPlayerType(null);
    }
  };

  const getPlayUrl = () => {
    if (isTVSeries && selectedEpisode) {
      if (playerType === "m3u8" && selectedEpisode.linkM3u8) {
        return selectedEpisode.linkM3u8;
      }
      if (playerType === "webview" && selectedEpisode.linkWebview) {
        return selectedEpisode.linkWebview;
      }
      return null;
    } else {
      if (playerType === "m3u8" && film.linkM3u8) {
        return film.linkM3u8;
      }
      if (playerType === "webview" && film.linkWebview) {
        return film.linkWebview;
      }
      return null;
    }
  };

  const playUrl = getPlayUrl();

  function withAutoplay(url: string) {
    if (url.includes("?")) {
      return url + "&autoplay=1";
    }
    return url + "?autoplay=1";
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">

      <div className="aspect-video bg-black relative">
        {hasWindow && playerType === "m3u8" && playUrl ? (
          // <ReactPlayer
          //   url={playUrl}
          //   controls
          //   playing
          //   width="100%"
          //   height="100%"
          //   onPlay={handlePlay}
          //   config={{
          //     file: {
          //       forceHLS: true,
          //       hlsOptions: {
          //         enableWorker: true,
          //         lowLatencyMode: true,
          //       },
          //       attributes: {
          //         controlsList: "nodownload",
          //       },
          //     },
          //   }}
          // />
          <iframe
            src={playUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            onLoad={handlePlay}
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
              src={toYoutubeEmbed(playUrl)}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              loading="lazy"
              onLoad={handlePlay}
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

      {/* Player Type Selector */}
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
            {film.episodes.map((episode) => (
              <button
                key={episode.id}
                onClick={() => handleEpisodeSelect(episode)}
                className={`px-3 py-2 rounded text-sm transition ${
                  selectedEpisode?.id === episode.id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Tập {episode.episodeNumber}
              </button>
            ))}
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
