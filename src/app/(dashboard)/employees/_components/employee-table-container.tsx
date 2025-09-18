"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { UserWithAllIncludes } from "@/types/user";
import { Role } from "@prisma/client";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { employeeColumns } from "./employee-column";

interface Props {
  data: UserWithAllIncludes[];
  cuRole: Role;
}

const EmployeeTableContainer = ({ data, cuRole }: Props) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState({
    role: cuRole === Role.SUPER_ADMIN, // only show if super admin
  });

  const table = useReactTable({
    data,
    columns: employeeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
      columnVisibility,
    },
  });
  return (
    <>
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Browse and search for employees by their ID.
            </CardDescription>
          </div>
          <Input
            className="max-w-[400px]"
            placeholder="Enter Employee ID"
            value={table.getColumn("employeeId")?.getFilterValue() as string}
            onChange={(e) => {
              table.getColumn("employeeId")?.setFilterValue(e.target.value);
            }}
          />
        </div>
      </CardHeader>
      <div className="space-y-5">
        <DataTable table={table} columns={employeeColumns} />

        <div className="space-x-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default EmployeeTableContainer;
