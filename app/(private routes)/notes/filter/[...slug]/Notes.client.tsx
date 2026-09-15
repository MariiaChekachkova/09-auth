"use client";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/clientApi";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import css from "./NotesPage.module.css";
import Link from "next/link";
import { useDebounce } from "use-debounce";

interface NotesClientProps {
  tag?: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, debouncedSearch, tag],
    queryFn: () => fetchNotes(page, debouncedSearch, tag),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return <p>Loading, please wait...</p>;
  }
  if (isError || !data) {
    return <p>Something went wrong.</p>;
  }
  return (
    <>
      <main className={css.app}>
        <div className={css.toolbar}>
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <Link href="/notes/action/create" className={css.button}>
            Create Note +
          </Link>
        </div>
        {data.notes.length > 0 && (
          <>
            {data.totalPages > 1 && (
              <Pagination
                pageCount={data.totalPages}
                currentPage={page}
                onPageChange={setPage}
              />
            )}

            <NoteList notes={data.notes} />
          </>
        )}
      </main>
    </>
  );
}
