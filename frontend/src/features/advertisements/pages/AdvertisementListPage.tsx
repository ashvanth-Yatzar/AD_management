import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SortingState } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";

import { useAdvertisements } from "@/features/advertisements/hooks/useAdvertisements";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type {
  AdvertisementListParams,
  AdvertisementStatus,
  MediaType,
} from "@/features/advertisements/types/advertisement.types";
import { STATUS_OPTIONS } from "@/features/advertisements/utils/advertisement.utils";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { AdvertisementTable } from "@/features/advertisements/components/AdvertisementTable";
import { ExportDropdown } from "@/features/advertisements/components/ExportDropdown";

const PAGE_SIZE = 10;

export function AdvertisementListPage() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdvertisementStatus | "">("");
  const [mediaFilter, setMediaFilter] = useState<MediaType | "">("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const debouncedSearch = useDebounce(search, 400);

  const sortBy = sorting[0]?.id ?? "created_at";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const params: AdvertisementListParams = {
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    media_type: mediaFilter || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data, isLoading, isFetching } = useAdvertisements(params);

  const advertisements = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.total_pages ?? 1;
  const currentPageIds = advertisements.map((a) => a.id);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val === "all" ? "" : val as AdvertisementStatus);
    setPage(1);
  };

  const handleMediaChange = (val: string) => {
    setMediaFilter(val === "all" ? "" : val as MediaType);
    setPage(1);
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Advertisements</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your advertisement campaigns
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown currentPageIds={currentPageIds} />
          <Button onClick={() => navigate("/advertisements/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Advertisement
          </Button>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title or content…"
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
            aria-label="Search advertisements"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mediaFilter} onValueChange={handleMediaChange}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by media type">
            <SelectValue placeholder="All media types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All media types</SelectItem>
            <SelectItem value="image_upload">Image Upload</SelectItem>
            <SelectItem value="url">URL</SelectItem>
          </SelectContent>
        </Select>

        {(search || statusFilter || mediaFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setMediaFilter("");
              setPage(1);
            }}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Total count indicator */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {total} advertisement{total !== 1 ? "s" : ""} found
          {isFetching && " · Refreshing…"}
        </p>
      )}

      {/* Table */}
      <AdvertisementTable
        data={advertisements}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onPageChange={setPage}
      />
    </div>
  );
}