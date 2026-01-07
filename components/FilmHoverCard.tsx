"use client";

import { Film } from "@/types";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface FilmHoverCardProps {
  film: Film;
  isVisible: boolean;
  position: { x: number; y: number };
}

export default function FilmHoverCard({
  film,
  isVisible,
  position,
}: FilmHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isVisible && cardRef.current) {
      const card = cardRef.current;
      const cardRect = card.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      const cardWidth = 320;
      const halfWidth = cardWidth / 2;

      if (x - halfWidth < 0) {
        x = halfWidth + 10;
      } else if (x + halfWidth > viewportWidth) {
        x = viewportWidth - halfWidth - 10;
      }

      const cardHeight = card.offsetHeight || 300;
      if (y - cardHeight < 0) {
        y = cardHeight + 10;
      }

      setAdjustedPosition({ x, y });
    }
  }, [isVisible, position]);

  if (!isVisible) return null;

  // Lấy quốc gia từ categories (type === "country")
  const country = film.categories?.find(
    (fc) => fc.category.type === "country"
  )?.category;

  // Lấy thể loại từ categories (type === "genre")
  const genres =
    film.categories
      ?.filter((fc) => fc.category.type === "genre")
      .map((fc) => fc.category.name) || [];

  const durationText =
    film.type === "tv" && film.duration
      ? `${film.duration} phút/tập`
      : film.duration
      ? `${film.duration} phút`
      : null;

  return (
    <div
      ref={cardRef}
      className="fixed z-50 w-80 bg-white rounded-lg shadow-2xl pointer-events-none"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        transform: "translate(-50%, -100%)",
        marginTop: "-10px",
      }}
    >
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-white"></div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-red-600 mb-1">{film.title}</h3>
          {/* <h4 className="text-lg font-semibold text-gray-900">{film.title}</h4> */}
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          {film.year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{film.year}</span>
            </div>
          )}
          {durationText && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{durationText}</span>
            </div>
          )}
        </div>

        {film.description && (
          <div
            className="text-sm text-gray-700 mb-3 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: film.description }}
          />
        )}

        {country && (
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Quốc gia:{" "}
            </span>
            <span className="text-sm text-gray-700">{country.name}</span>
          </div>
        )}

        {genres.length > 0 && (
          <div>
            <span className="text-sm font-semibold text-gray-900">
              Thể loại:{" "}
            </span>
            <span className="text-sm text-gray-700">{genres.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
