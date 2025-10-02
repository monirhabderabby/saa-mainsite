"use client";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { UsersData } from "@/helper/users";
import { useUserFilterStore } from "@/zustand/users";
import { Role } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { getEmployeeColumns } from "./employee-column";
// import { getEmployeeColumns } from "./employee-column";

interface Props {
  currentUserRole: Role;
}

const UserTableContainer = ({ currentUserRole }: Props) => {
  let {
    page,
    searchQuery,
    serviceId,
    accountStatus,
    role,
    departmentId,
    teamId,
  } = useUserFilterStore();

  departmentId = departmentId ?? "";
  serviceId = serviceId ?? "";
  teamId = teamId ?? "";
  role = role ?? "";
  accountStatus = accountStatus ?? "ACTIVE";
  page = page ?? "";
  searchQuery = searchQuery ?? "";

  const { data, isError, error, isLoading } = useQuery({
    queryKey: [
      "users",
      page,
      searchQuery,
      serviceId,
      accountStatus,
      role,
      departmentId,
      teamId,
    ],
    queryFn: () =>
      fetch(
        `/api/users?page=${page}&limit=10&searchQuery=${searchQuery}&serviceId=${serviceId}&accountStatus=${accountStatus}&role=${role}&departmentId=${departmentId}&teamId=${teamId}`
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
              columns={getEmployeeColumns({ currentUserRole })}
              data={data?.data ? [...data.data] : []}
              totalPages={data?.pagination?.totalPages ?? 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
      <div className="bg-background ">
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
