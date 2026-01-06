"use client";

import { useState, useEffect, useRef } from "react";
import { Film } from "@/types";
import FilmPlayer from "./FilmPlayer";
import { incrementView } from "@/lib/service";

interface FilmPlayerWrapperProps {
  film: Film;
}

export default function FilmPlayerWrapper({ film }: FilmPlayerWrapperProps) {
  const [shouldLoadPlayer, setShouldLoadPlayer] = useState(false);
  const [filmWithUpdatedView, setFilmWithUpdatedView] = useState(film);
  const playerRef = useRef<HTMLDivElement>(null);
  const hasIncrementedView = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadPlayer(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px",
      }
    );

    if (playerRef.current) {
      observer.observe(playerRef.current);
    }

    const timeout = setTimeout(() => {
      setShouldLoadPlayer(true);
      observer.disconnect();
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const handleView = async () => {
    if (hasIncrementedView.current) return;
    
    try {
      hasIncrementedView.current = true;
      await incrementView(film.id);
      setFilmWithUpdatedView({
        ...filmWithUpdatedView,
        viewCount: filmWithUpdatedView.viewCount + 1,
      });
    } catch (error) {
      console.error("Error incrementing view:", error);
      hasIncrementedView.current = false;
    }
  };

  return (
    <div ref={playerRef}>
      {shouldLoadPlayer ? (
        <FilmPlayer film={filmWithUpdatedView} onView={handleView} />
      ) : (
        <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải player...</p>
          </div>
        </div>
      )}
    </div>
  );
}

