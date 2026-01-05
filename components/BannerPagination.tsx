import { Film } from "@/types";

function BannerPagination({ film }: { film: Film }) {
  const imgSrc = process.env.NEXT_PUBLIC_TMDB_IMAGE + (film.poster || "/placeholder.jpg");
  return <div className="banner-item rounded-[0.5rem]">
    <img
      src={imgSrc}
      alt={film.title}
      className="absolute inset-0 h-full w-full object-cover rounded-[0.5rem]"
    />
  </div>;
}

export default BannerPagination;
