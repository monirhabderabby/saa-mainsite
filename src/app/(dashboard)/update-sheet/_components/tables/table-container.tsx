"use client";

import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { GetUpdateSheetsReturn, UpdateSheetData } from "@/helper/update-sheet";
import { useUpdateSheetFilterState } from "@/zustand/update-sheet";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { updateSheetColumns } from "./update-sheet-columns";

const TableContainer = () => {
  let {
    page,
    profileId,
    updateTo,
    clientName,
    orderId,
    tl,
    done,
    createdFrom,
  } = useUpdateSheetFilterState();

  profileId = profileId ?? "All";
  page = page ?? 1;
  updateTo = updateTo ?? "All";
  clientName = clientName ?? "";
  orderId = orderId ?? "";
  tl = tl ?? "All";
  done = done ?? "All";
  createdFrom = createdFrom
    ? new Date(createdFrom).toISOString().split("T")[0] // "2025-09-14"
    : new Date().toISOString().split("T")[0];

  const { data, isLoading, isError, error } = useQuery<GetUpdateSheetsReturn>({
    queryKey: [
      "update-entries",
      page,
      profileId,
      updateTo,
      clientName,
      orderId,
      tl,
      done,
      createdFrom,
    ],
    queryFn: () =>
      fetch(
        `/api/update-entries?profileId=${profileId}&updateTo=${updateTo}&clientName=${clientName}&orderId=${orderId}&page=${page}&limit=10&tl=${tl}&done=${done}&createdFrom=${createdFrom}`
      ).then((res) => res.json()),
  });

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

  return (
    <SkeletonWrapper isLoading={isLoading}>
      <Table
        columns={updateSheetColumns}
        data={data?.data ?? []}
        totalPages={data?.pagination?.totalPages ?? 1}
      />
    </SkeletonWrapper>
  );
};

export default TableContainer;

interface TableProps {
  data: UpdateSheetData[];
  columns: ColumnDef<UpdateSheetData>[];
  totalPages: number;
}

const Table = ({ data, columns, totalPages }: TableProps) => {
  const { setPage, page } = useUpdateSheetFilterState();
  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <div className="bg-background">
        <DataTable table={table} columns={columns} />
      </div>
      {totalPages > 1 && (
        <div className="mt-4 w-full  flex justify-end">
          <div>
            <PaginationControls
              currentPage={page}
              onPageChange={(page) => setPage(page)}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}
    </>
  );
};
