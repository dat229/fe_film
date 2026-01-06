export default function FilmCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-700 w-full"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}

