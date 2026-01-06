"use client";

import { useEffect, useState } from "react";
import { Film, SearchFilms } from "@/types";
import FilmCard from "@/components/FilmCard";
import { Tv } from "lucide-react";
import { getFilms } from "@/lib/service";

export default function TVSeriesPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTVSeries();
  }, [page]);

  const fetchTVSeries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", "tv");
      params.append("page", page.toString());
      params.append("limit", "24");
      params.append("sortBy", "createdAt");
      params.append("sortOrder", "desc");

      const data: SearchFilms = await getFilms(params);
      setFilms(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching TV series:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Tv className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Phim Bộ</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : films.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Trước
              </button>
              <span className="px-4 py-2">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Không có phim bộ nào
        </div>
      )}
    </div>
  );
}

