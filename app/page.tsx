import { Film, HomeFilms } from "@/types";
import FilmCard from "@/components/FilmCard";
import { TrendingUp, Clock, Star } from "lucide-react";
import { getHomeFilms } from "@/lib/service";
import FeaturedSlider from "@/components/FeaturedSlider";

export default async function Home() {
  const homeData: HomeFilms = await getHomeFilms();

  return (
    <div className="container mx-auto">
      {homeData?.featured && homeData.featured.length > 0 && (
        <FeaturedSlider films={homeData.featured} />
      )}

      {homeData?.popular && (
        <section className="mb-8 md:mb-12 px-4 md:px-0">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Phim Phổ Biến</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {homeData.popular.map((film: Film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      )}

      {homeData?.latest && (
        <section className="mb-8 md:mb-12 px-4 md:px-0">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Phim Mới Nhất</h2>
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
        <section className="mb-8 md:mb-12 px-4 md:px-0">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Phim Đánh Giá Cao</h2>
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
