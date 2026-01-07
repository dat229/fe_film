import { Film, SearchFilms } from "@/types";
import { Film as FilmIcon } from "lucide-react";
import { getFilms } from "@/lib/service";
import MoviesContent from "@/components/MoviesContent";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function fetchMovies(page: number = 1) {
  try {
    const params = new URLSearchParams();
    params.append("type", "movie");
    params.append("page", page.toString());
    params.append("limit", "24");
    params.append("sortBy", "createdAt");
    params.append("sortOrder", "desc");

    const data: SearchFilms = await getFilms(params);
    return {
      films: data.data || [],
      totalPages: data.pagination?.totalPages || 1,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching movies:", error);
    return {
      films: [],
      totalPages: 1,
      currentPage: 1,
    };
  }
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const { films, totalPages, currentPage } = await fetchMovies(page);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <FilmIcon className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Phim Lẻ
        </h1>
      </div>

      {films.length > 0 ? (
        <MoviesContent
          films={films}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      ) : (
        <div className="text-center py-12 text-gray-400">
          Không có phim lẻ nào
        </div>
      )}
    </div>
  );
}
