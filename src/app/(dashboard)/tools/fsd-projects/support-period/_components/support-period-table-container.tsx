"use client";

import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useSupportPeriodState } from "./states/support-period-state";
import { getSupportPeriodColumn } from "./support-period-column";

export interface FSDProjectApiProps {
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

const SupportPeriodTableContainer = () => {
  const { page, setPage, teamIds } = useSupportPeriodState();

  const preparedTeamids = teamIds ? teamIds?.join(",") : "";

  const { data, isError, error, isLoading } = useQuery<FSDProjectApiProps>({
    queryKey: ["support-projects", preparedTeamids],
    queryFn: () =>
      fetch(
        `/api/tools/fsd-project/supportGoing?teamIds=${preparedTeamids}`,
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
                columns={getSupportPeriodColumn()}
                data={data?.data ? [...data.data] : []}
                totalPages={data?.pagination?.totalPages ?? 1}
                page={page}
                setPage={setPage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </SkeletonWrapper>
    </div>
  );
};

export default SupportPeriodTableContainer;

interface TableProps {
  data: SafeProjectDto[];
  columns: ColumnDef<SafeProjectDto>[];
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
}

const Table = ({ data, columns, totalPages, page, setPage }: TableProps) => {
  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalWorkload = data.reduce(
    (acc, project) => acc + project.monetaryValue,
    0,
  );
  return (
    <>
      <div className="bg-background ">
        <DataTable table={table} columns={columns} />
      </div>

      <div className="mt-4 w-full  flex justify-between items-center">
        <div>
          <p className="text-xs text-foreground">
            Total : <span className="font-semibold">${totalWorkload}</span>
          </p>
        </div>

        {totalPages > 1 && (
          <div>
            <PaginationControls
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
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
