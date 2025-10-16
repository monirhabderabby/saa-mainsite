"use client";

import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import {
  GetUpdateSheetsReturn,
  UpdateSheetData,
} from "@/helper/update-sheet/update-sheet";
import { useUpdateSheetFilterState } from "@/zustand/update-sheet";
import { Prisma, Role } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
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

const TableContainer = ({
  currentUserRole,
  currentUserId,
  currentUserTeam,
}: Props) => {
  const {
    page: rawPage,
    profileId,
    updateTo: rawUpdateTo,
    clientName: rawClientName,
    orderId: rawOrderId,
    tl: rawTl,
    done: rawDone,
    createdFrom: rawCreatedFrom,
    sendFrom: rawSendFrom,
  } = useUpdateSheetFilterState();

  // Apply defaults
  const page = rawPage ?? 1;
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

  // Join profileIds for API
  const profileIds = profileId?.join(",") ?? "All";

  const { data, isLoading, isError, error } = useQuery<GetUpdateSheetsReturn>({
    queryKey: [
      "update-entries",
      page,
      profileIds,
      updateTo,
      clientName,
      orderId,
      tl,
      done,
      createdFrom,
      sendFrom,
    ],
    queryFn: () =>
      fetch(
        `/api/update-entries?profileId=${profileIds}&updateTo=${updateTo}&clientName=${clientName}&orderId=${orderId}&page=${page}&limit=25&tl=${tl}&done=${done}&createdFrom=${createdFrom}&sendFroms=${sendFrom}`
      ).then((res) => res.json()),
    staleTime: 60 * 1000, // Data is considered "fresh" for 30s
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
        columns={updateSheetColumns({
          currentUserRole,
          currentUserId,
          currentUserTeam,
        })}
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
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
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
