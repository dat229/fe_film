"use client";

import { Film } from "@/types";
import { Play, Star } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useRef, useState, useEffect } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface FeaturedSliderProps {
  films: Film[];
}

export default function FeaturedSlider({ films }: FeaturedSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!films || films.length === 0) return null;

  return (
    <section className="relative mb-12">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        // navigation={true}
        loop={films.length > 1}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        className="relative min-h-[400px] h-[400px] sm:min-h-[500px] sm:h-[500px] md:min-h-[600px] md:h-[600px] lg:min-h-[700px] lg:h-[700px] rounded-lg overflow-hidden mb-4"
      >
        {films.map((film) => (
          <SwiperSlide key={film.id}>
            <div className="relative h-full w-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    process.env.NEXT_PUBLIC_TMDB_IMAGE
                  }${film.poster || "/placeholder.jpg"})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
              </div>
              <div className="relative h-full flex items-center px-4 sm:px-6 md:px-8">
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-white">
                    {film.title}
                  </h1>
                  {film.description && (
                    <div
                      className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 text-gray-300 line-clamp-2 md:line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: film.description || "",
                      }}
                    />
                  )}
                  <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
                    {film.year && (
                      <span className="px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 rounded text-xs md:text-sm text-white">
                        {film.year}
                      </span>
                    )}
                    {Number(film.rating || 0) > 0 && (
                      <span className="px-3 py-1.5 md:px-4 md:py-2 bg-yellow-600 rounded flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white">
                        <Star className="w-3 h-3 md:w-4 md:h-4" />
                        {Number(film.rating || 0).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/film/${film.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition text-white text-sm md:text-base"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    Xem ngay
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {films.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-10 hidden lg:flex gap-2 justify-center mt-4">
          {films.map((film, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={film.id}
                onClick={() => {
                  if (swiperRef.current) {
                    swiperRef.current.slideToLoop(index);
                  }
                }}
                className={`relative w-24 h-24 rounded-lg overflow-hidden transition-all duration-300 ${
                  isActive
                    ? "ring-2 ring-primary-500 scale-110"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE}${
                    film.poster || film.thumbnail || "/placeholder.jpg"
                  }`}
                  alt={film.title}
                  className="w-full h-full object-cover"
                  loading={isMobile ? "lazy" : undefined}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-primary-500/20" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

