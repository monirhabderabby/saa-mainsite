"use client";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { UsersData } from "@/helper/users";
import { useDebounce } from "@/hook/use-debounce";
import { useUserFilterStore } from "@/zustand/users";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { employeeColumns } from "./employee-column";

const UserTableContainer = () => {
  const { page, searchQuery, serviceId } = useUserFilterStore();

  const debouncedValue = useDebounce(searchQuery);

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["users", page, debouncedValue, serviceId],
    queryFn: () =>
      fetch(
        `/api/users?page=${page}&limit=10&searchQuery=${debouncedValue}&serviceId=${serviceId}`
      ).then((res) => res.json()),
  });

  if (isError) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center space-y-2">
        <AlertTriangle size={32} />
        <p className="text-lg font-medium">Failed to load issue sheets</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error?.message || "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }
  return (
    <SkeletonWrapper isLoading={isLoading}>
      <Table
        columns={employeeColumns}
        data={data?.data ?? []}
        totalPages={data?.pagination?.totalPages ?? 1}
      />
    </SkeletonWrapper>
  );
};

export default UserTableContainer;

interface TableProps {
  data: UsersData[];
  columns: ColumnDef<UsersData>[];
  totalPages: number;
}

const Table = ({ data, columns, totalPages }: TableProps) => {
  const { setPage, page } = useUserFilterStore();
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
