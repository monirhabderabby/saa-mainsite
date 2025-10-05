"use client";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import {
  GetIssueSheetsReturn,
  IssueSheetData,
} from "@/helper/issue-sheets/get-issue-sheets";
import { useIssueSheetFilterState } from "@/zustand/issue-sheet";
import { Role } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { issueSheetColumns } from "./issue-sheet-column";

interface Props {
  currentUserRole: Role;
  canEdit: boolean;
}

const IssueTableContainer = ({ currentUserRole, canEdit }: Props) => {
  let {
    status: storeStatus,
    page,
    profileId,
    serviceId,
    teamId,
    clientName,
    orderId,
    createdFrom,
    createdTo,
  } = useIssueSheetFilterState();
  page = page ?? 1;
  storeStatus = storeStatus;
  profileId = profileId ?? "";
  const joinedStatus =
    storeStatus && storeStatus.length > 0 && storeStatus.join(",");
  serviceId = serviceId ?? "All";
  teamId = teamId ?? "All";
  clientName = clientName ?? "";
  orderId = orderId ?? "";
  createdFrom = createdFrom ?? "";
  createdTo = createdTo ?? "";

  const { data, isLoading, isError, error } = useQuery<GetIssueSheetsReturn>({
    queryKey: [
      "issue-sheet",
      storeStatus,

      profileId,
      serviceId,
      teamId,
      clientName,
      orderId,
      createdFrom,
      createdTo,
      page,
    ],
    queryFn: () =>
      fetch(
        `/api/issue-sheets?status=${joinedStatus}&page=${page}&limit=10&profileId=${profileId}&serviceId=${serviceId}&teamId=${teamId}&clientName=${clientName}&orderId=${orderId}&createdFrom=${createdFrom}&createdTo=${createdTo}`
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
        columns={issueSheetColumns({ canEdit, currentUserRole })}
        data={data?.data ?? []}
        totalPages={data?.pagination?.totalPages ?? 1}
      />
    </SkeletonWrapper>
  );
};

export default IssueTableContainer;

interface TableProps {
  data: IssueSheetData[];
  columns: ColumnDef<IssueSheetData>[];
  totalPages: number;
}

const Table = ({ data, columns, totalPages }: TableProps) => {
  const { setPage, page } = useIssueSheetFilterState();
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
