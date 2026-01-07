"use client";

import Link from "next/link";
import { Film } from "@/types";
import { Eye, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import FilmHoverCard from "./FilmHoverCard";

interface FilmCardProps {
  film: Film;
}

export default function FilmCard({ film }: FilmCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isLaptop, setIsLaptop] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLaptop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current && isHovered) {
        const rect = cardRef.current.getBoundingClientRect();
        setHoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    };

    if (isHovered) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isHovered]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setHoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/film/${film.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition">
          <div className="aspect-[2/3] relative">
            <img
              src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE}${
                film.poster || film.thumbnail || "/placeholder.jpg"
              }`}
              alt={film.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading={isLaptop ? "eager" : "lazy"}
            />
          </div>
          <div className="p-3">
            <h3 className="min-h-[40px] font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary-400 transition">
              {film.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-400">
              {film.year && <span>{film.year}</span>}
              <div className="flex items-center gap-3">
                {film.viewCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {film.viewCount.toLocaleString()}
                  </span>
                )}
                {Number(film.rating) > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3" />
                    {Number(film.rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Hover Card */}
      <FilmHoverCard
        film={film}
        isVisible={isHovered}
        position={hoverPosition}
      />
    </div>
  );
}
