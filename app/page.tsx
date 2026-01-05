"use client";

import { Film, HomeFilms } from "@/types";
import FilmCard from "@/components/FilmCard";
import { Play, TrendingUp, Clock, Star } from "lucide-react";
import { getHomeFilms } from "@/lib/service";
import { useState, useEffect } from "react";

export default function Home() {
  const [homeData, setHomeData] = useState<HomeFilms | null>(null);
  useEffect(() => {
    const fetchHomeData = async () => {
      const data = await getHomeFilms();
      setHomeData(data);
    };
    fetchHomeData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {homeData?.featured && homeData.featured.length > 0 && (
        <section className="mb-12">
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            {homeData.featured[0] && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${`${
                      process.env.NEXT_PUBLIC_TMDB_IMAGE
                    }${homeData.featured[0].poster || "/placeholder.jpg"}`})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
                </div>
                <div className="relative h-full flex items-center px-8">
                  <div className="max-w-2xl">
                    <h1 className="text-5xl font-bold mb-4">
                      {homeData.featured[0].title}
                    </h1>
                    {/* <p className="text-lg mb-6 text-gray-300 line-clamp-3">
                      {homeData.featured[0].description}
                    </p> */}
                    <div
                      className="text-lg mb-6 text-gray-300 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: homeData.featured[0].description || '',
                      }}
                    />
                    <div className="flex gap-4 mb-6">
                      {homeData.featured[0].year && (
                        <span className="px-4 py-2 bg-primary-600 rounded">
                          {homeData.featured[0].year}
                        </span>
                      )}
                      {homeData.featured[0].rating && (
                        <span className="px-4 py-2 bg-yellow-600 rounded flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {homeData.featured[0].rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <a
                      href={`/film/${homeData.featured[0].slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
                    >
                      <Play className="w-5 h-5" />
                      Xem ngay
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {homeData?.popular && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-500" />
            <h2 className="text-3xl font-bold">Phim Phổ Biến</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {homeData.popular.map((film: Film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      )}

      {homeData?.latest && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-primary-500" />
            <h2 className="text-3xl font-bold">Phim Mới Nhất</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {homeData.latest.map((film: Film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Films */}
      {homeData?.topRated && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-primary-500" />
            <h2 className="text-3xl font-bold">Phim Đánh Giá Cao</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {homeData.topRated.map((film: Film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
