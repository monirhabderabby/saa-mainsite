"use client";

import { DataTable } from "@/components/ui/data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import {
  GetUpdateSheetsReturn,
  UpdateSheetData,
} from "@/helper/update-sheet/update-sheet";
import { useUpdateSheetFilterState } from "@/zustand/update-sheet";
import { Prisma, Role } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateSheetColumns } from "./update-sheet-columns";

export type CurrentUserTeam = Prisma.UserTeamGetPayload<{
  include: {
    team: {
      include: {
        service: true;
      };
    };
  };
}>;

interface Props {
  currentUserRole: Role;
  currentUserId: string;
  currentUserTeam?: CurrentUserTeam | null;
}

const hideServicelineDefaultFilters = [
  "ADMIN",
  "SUPER_ADMIN",
  "SALES_MEMBER",
] as Role[];

const TableContainer = ({
  currentUserRole,
  currentUserId,
  currentUserTeam,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    profileId,
    updateTo: rawUpdateTo,
    clientName: rawClientName,
    orderId: rawOrderId,
    tl: rawTl,
    done: rawDone,
    createdFrom: rawCreatedFrom,
    sendFrom: rawSendFrom,
    serviceId: rawServiceId,
  } = useUpdateSheetFilterState();

  const updateTo = rawUpdateTo ?? "All";
  const clientName = rawClientName ?? "";
  const orderId = rawOrderId ?? "";
  const tl = rawTl ?? "All";
  const done = rawDone ?? "All";
  const createdFrom = rawCreatedFrom
    ? new Date(rawCreatedFrom).toISOString().split("T")[0]
    : "All";
  const sendFrom = rawSendFrom
    ? new Date(rawSendFrom).toISOString().split("T")[0]
    : "All";

  const profileIds = profileId?.join(",") ?? "All";

  const serviceId = hideServicelineDefaultFilters.includes(currentUserRole)
    ? "All"
    : (rawServiceId ?? "All");

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GetUpdateSheetsReturn>({
    queryKey: [
      "update-entries",
      profileIds,
      updateTo,
      clientName,
      orderId,
      tl,
      done,
      createdFrom,
      sendFrom,
      serviceId,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1, signal }) =>
      fetch(
        `/api/update-entries?profileId=${profileIds}&updateTo=${updateTo}&clientName=${clientName}&orderId=${orderId}&page=${pageParam}&limit=25&tl=${tl}&done=${done}&createdFrom=${createdFrom}&sendFroms=${sendFrom}&serviceId=${serviceId}`,
        {
          signal,
        }
      ).then((res) => res.json()),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
  });

  // Prefetch next page in advance
  useEffect(() => {
    if (!data || !hasNextPage) return;

    const nextPageNumber = currentPage + 1;
    const nextPageLoaded = data.pages.some(
      (page) => page.pagination.currentPage === nextPageNumber
    );

    if (!nextPageLoaded) {
      fetchNextPage();
    }
  }, [currentPage, data, fetchNextPage, hasNextPage]);

  if (isError) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center space-y-2">
        <AlertTriangle size={32} />
        <p className="text-lg font-medium">Failed to load documents</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error?.message || "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }

  // Flatten pages for table
  const allData = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <SkeletonWrapper isLoading={isLoading}>
      <Table
        columns={updateSheetColumns({
          currentUserRole,
          currentUserId,
          currentUserTeam,
        })}
        data={allData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </SkeletonWrapper>
  );
};

export default TableContainer;

interface TableProps {
  data: UpdateSheetData[];
  columns: ColumnDef<UpdateSheetData>[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}

const Table = ({
  data,
  columns,
  setCurrentPage,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: TableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Notify which page user is viewing
  useEffect(() => {
    const page = table.getState().pagination.pageIndex + 1;
    setCurrentPage(page);
  }, [setCurrentPage, table]);

  useEffect(() => {
    const observerTarget = observerRef.current;
    if (!scrollRef.current || !observerTarget || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { root: scrollRef.current, rootMargin: "200px" }
    );

    observer.observe(observerTarget);
    return () => {
      observer.unobserve(observerTarget);
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  return (
    <div className="bg-background">
      <ScrollArea className="h-[75vh] w-full" ref={scrollRef}>
        <DataTable table={table} columns={columns} />
        {/* Invisible div at bottom to trigger next page */}
        <div ref={observerRef} className="h-4" />
        {isFetchingNextPage && (
          <p className="text-center py-2 text-gray-500">Loading more...</p>
        )}
      </ScrollArea>
    </div>
  );
};
