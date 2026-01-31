"use client";

import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { useFsdProjectFilterState } from "@/zustand/tools/fsd-project";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { getFSDProjectsColumn } from "./fsd-project-column";

interface ApiResponse {
  success: boolean;
  data: SafeProjectDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const FsdProjectTableContainer = () => {
  let { clientName, orderId, teamId } = useFsdProjectFilterState();
  clientName = clientName ?? "";
  orderId = orderId ?? "";
  let preparedTeamids = teamId ? teamId?.join(",") : "";

  const { data, isError, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["fsd-projects", clientName, orderId, preparedTeamids],
    queryFn: () =>
      fetch(
        `/api/tools/fsd-project?clientName=${clientName}&orderId=${orderId}&teamIds=${preparedTeamids}`,
      ).then((res) => res.json()),
  });

  if (isError) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center space-y-2">
        <AlertTriangle size={32} />
        <p className="text-lg font-medium">Failed to load projects</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error?.message || "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <SkeletonWrapper isLoading={isLoading}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="table-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[200px] w-full rounded-lg bg-background border"
            >
              <TableSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="user-table"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Table
                columns={getFSDProjectsColumn()}
                data={data?.data ? [...data.data] : []}
                totalPages={data?.pagination?.totalPages ?? 1}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </SkeletonWrapper>
    </div>
  );
};

export default FsdProjectTableContainer;

interface TableProps {
  data: SafeProjectDto[];
  columns: ColumnDef<SafeProjectDto>[];
  totalPages: number;
}

const Table = ({ data, columns, totalPages }: TableProps) => {
  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <div className="bg-background ">
        <DataTable table={table} columns={columns} />
      </div>
      {totalPages > 1 && (
        <div className="mt-4 w-full  flex justify-end">
          <div>
            <PaginationControls
              currentPage={1}
              onPageChange={(page) => {
                console.log(page);
              }}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}
    </>
  );
};

const TableSkeleton = () => {
  return (
    <div className="divide-y divide-border">
      {/* Fake header */}
      <div className="flex px-4 py-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 rounded" />
        ))}
      </div>
      {/* Fake rows */}
      {[...Array(6)].map((_, row) => (
        <div key={row} className="flex px-4 py-3 gap-4">
          {[...Array(5)].map((_, col) => (
            <Skeleton key={col} className="h-4 w-20 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};
