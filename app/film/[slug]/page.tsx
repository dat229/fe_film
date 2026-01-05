"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Film } from "@/types";
import FilmPlayer from "@/components/FilmPlayer";
import FilmCard from "@/components/FilmCard";
import { Calendar, Clock, Eye, Star, Tag, Play } from "lucide-react";

export default function FilmDetailPage() {
  const params = useParams();
  const [film, setFilm] = useState<Film | null>(null);
  const [relatedFilms, setRelatedFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchFilmDetail();
    }
  }, [params.slug]);

  const fetchFilmDetail = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/films/slug/${params.slug}`
      );
      const data = await response.json();
      setFilm(data);

      // Fetch related films (same category)
      if (data.categories && data.categories.length > 0) {
        const categoryId = data.categories[0].categoryId;
        const relatedResponse = await fetch(
          `http://localhost:3001/films?categoryId=${categoryId}&limit=12`
        );
        const relatedData = await relatedResponse.json();
        setRelatedFilms(
          relatedData.data?.filter((f: Film) => f.id !== data.id) || []
        );
      }
    } catch (error) {
      console.error("Error fetching film detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (film) {
      try {
        await fetch(`http://localhost:3001/films/${film.id}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error incrementing view:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy phim</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <img
              src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE}${
                film.poster || "/placeholder.jpg"
              }`}
              alt={film.title}
              className="w-full md:w-64 rounded-lg shadow-lg"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{film.title}</h1>
            <div className="flex flex-wrap gap-4 mb-4">
              {film.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <span>{film.year}</span>
                </div>
              )}
              {film.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <span>{film.duration} phút</span>
                </div>
              )}
              {film.viewCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-500" />
                  <span>{film.viewCount.toLocaleString()} lượt xem</span>
                </div>
              )}
              {film.rating && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{film.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {film.description && (
              <div
                className="text-gray-300 mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: film.description }}
              />
            )}
            {film.categories && film.categories.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold">Thể loại:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {film.categories.map((fc) => (
                    <span
                      key={fc.id}
                      className="px-3 py-1 bg-primary-600 rounded-full text-sm"
                    >
                      {fc.category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {film.actors && film.actors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Diễn viên:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {film.actors.map((fa) => (
                    <span
                      key={fa.id}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                    >
                      {fa.actor.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="film-player" className="mb-8">
        <FilmPlayer film={film} onView={handleView} />
      </div>

      {relatedFilms.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Phim Liên Quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {relatedFilms.map((relatedFilm) => (
              <FilmCard key={relatedFilm.id} film={relatedFilm} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
