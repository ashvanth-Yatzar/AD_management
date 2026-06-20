import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  OnChangeFn,
  Updater,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/Table";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Loader } from "@/shared/components/feedback/Loader";
import { cn } from "@/shared/utils/cn";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  sorting,
  onSortingChange,
  className,
}: DataTableProps<TData, TValue>) {
  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue: Updater<SortingState>) => {
    if (!onSortingChange) return;
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting ?? [])
        : updaterOrValue;
    onSortingChange(newSorting);
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <div className={cn("rounded-md border bg-white overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "font-semibold text-slate-700 whitespace-nowrap",
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <Loader size="md" text="Loading records…" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <EmptyState
                    title="No advertisements found"
                    description="Try adjusting your search or filters."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
