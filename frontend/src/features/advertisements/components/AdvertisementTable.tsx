import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Edit, Trash2, ImageIcon, Link2 } from "lucide-react";

import type { Advertisement } from "@/features/advertisements/types/advertisement.types";
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  MEDIA_TYPE_LABELS,
  getImageUrl,
} from "@/features/advertisements/utils/advertisement.utils";
import { formatDate } from "@/shared/utils/date";

import { DataTable } from "@/shared/components/table/DataTable";
import { Pagination } from "@/shared/components/table/Pagination";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmDeleteModal } from "@/shared/components/modals/ConfirmDeleteModal";
import { useDeleteAdvertisement } from "@/features/advertisements/hooks/useDeleteAdvertisement";

interface AdvertisementTableProps {
  data: Advertisement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
}

export function AdvertisementTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  isLoading,
  sorting,
  onSortingChange,
  onPageChange,
}: AdvertisementTableProps) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { mutate: deleteAd, isPending: isDeleting } = useDeleteAdvertisement();

  const columns = useMemo<ColumnDef<Advertisement>[]>(
    () => [
      {
        id: "index",
        header: "#",
        size: 52,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {(page - 1) * pageSize + row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "media_type",
        header: "Media Type",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge variant="outline" className="gap-1">
            {getValue<string>() === "image_upload" ? (
              <ImageIcon className="h-3 w-3" />
            ) : (
              <Link2 className="h-3 w-3" />
            )}
            {MEDIA_TYPE_LABELS[getValue<"image_upload" | "url">()]}
          </Badge>
        ),
      },
      {
        id: "media_preview",
        header: "Preview",
        enableSorting: false,
        cell: ({ row }) => {
          const ad = row.original;
          if (ad.media_type === "image_upload" && ad.image_path) {
            const url = getImageUrl(ad.image_path);
            return url ? (
              <img
                src={url}
                alt={ad.title}
                className="h-10 w-16 rounded object-cover border"
              />
            ) : (
              <span className="text-muted-foreground text-xs">—</span>
            );
          }
          if (ad.media_type === "url" && ad.media_url) {
            return (
              <a
                href={ad.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline max-w-[120px] truncate block"
              >
                {ad.media_url}
              </a>
            );
          }
          return <span className="text-muted-foreground text-xs">—</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ getValue }) => {
          const status = getValue<Advertisement["status"]>();
          return (
            <Badge variant={STATUS_VARIANTS[status]}>
              {STATUS_LABELS[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-sm whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-sm whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/advertisements/${id}/edit`)}
                title="Edit"
                aria-label="Edit advertisement"
                className="h-8 w-8"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(id)}
                title="Delete"
                aria-label="Delete advertisement"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [page, pageSize, navigate]
  );

  return (
    <div className="space-y-0">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={onSortingChange}
      />

      <div className="border-t bg-white rounded-b-md">
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>

      <ConfirmDeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteAd(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        isPending={isDeleting}
      />
    </div>
  );
}
