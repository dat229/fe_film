import { Suspense } from "react";
import { Film } from "@/types";
import FilmPlayer from "@/components/FilmPlayer";
import FilmCard from "@/components/FilmCard";
import { Calendar, Clock, Eye, Star, Tag } from "lucide-react";
import { getDetailFilmBySlug, getFilms } from "@/lib/service";
import Image from "next/image";
import FilmPlayerWrapper from "@/components/FilmPlayerWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function fetchFilmDetail(slug: string) {
  try {
    const film = await getDetailFilmBySlug(slug);
    
    // Parallel fetch related films
    let relatedFilms: Film[] = [];
    if (film.categories && film.categories.length > 0) {
      const categoryId = film.categories[0].categoryId;
      try {
        const relatedData = await getFilms(`categoryId=${categoryId}&limit=12`);
        relatedFilms =
          relatedData?.data?.filter((f: Film) => f.id !== film.id) || [];
      } catch (error) {
        console.error("Error fetching related films:", error);
      }
    }

    return { film, relatedFilms };
  } catch (error) {
    console.error("Error fetching film detail:", error);
    throw error;
  }
}

export default async function FilmDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { film, relatedFilms } = await fetchFilmDetail(params.slug);

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
            <div className="relative w-full md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE}${film.poster || "/placeholder.jpg"}`}
                alt={film.title}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQADAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{film.title}</h1>
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
                  <span>
                    {film.duration} {film.type === "tv" ? "phút/tập" : "phút"}
                  </span>
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
        <Suspense
          fallback={
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          }
        >
          <FilmPlayerWrapper film={film} />
        </Suspense>
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
