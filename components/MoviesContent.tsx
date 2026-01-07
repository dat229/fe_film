"use client";

import { Film } from "@/types";
import FilmCard from "./FilmCard";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface MoviesContentProps {
  films: Film[];
  totalPages: number;
  currentPage: number;
}

export default function MoviesContent({
  films,
  totalPages,
  currentPage,
}: MoviesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      router.push(`/movies?${params.toString()}`);
    });
  };

  return (
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          >
            {isPending ? "Đang tải..." : "Trước"}
          </button>
          <span className="px-4 py-2 flex items-center">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          >
            {isPending ? "Đang tải..." : "Sau"}
          </button>
        </div>
      )}
    </>
  );
}

