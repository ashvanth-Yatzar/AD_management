import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/DropdownMenu";
import { Button } from "@/shared/components/ui/Button";
import { ChevronDown, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { advertisementApi } from "@/features/advertisements/api/advertisement.api";
import type { ExportFormat } from "@/features/advertisements/types/advertisement.types";
import { toast } from "sonner";

interface ExportDropdownProps {
  currentPageIds?: string[];
}

const FORMAT_CONFIG: {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    format: "excel",
    label: "Excel (.xlsx)",
    icon: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
  },
  {
    format: "pdf",
    label: "PDF (.pdf)",
    icon: <FileText className="h-4 w-4 text-red-500" />,
  },
  {
    format: "word",
    label: "Word (.docx)",
    icon: <FileType className="h-4 w-4 text-blue-600" />,
  },
];

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const EXT_MAP: Record<ExportFormat, string> = {
  excel: "xlsx",
  pdf: "pdf",
  word: "docx",
};

export function ExportDropdown({ currentPageIds }: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: ExportFormat, scope: "page" | "all") => {
    setIsExporting(true);
    try {
      const ids = scope === "page" ? currentPageIds : undefined;
      const url = advertisementApi.exportFile(format, ids);
      triggerDownload(url, `advertisements.${EXT_MAP[format]}`);
      toast.success(`Export started — ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Current Page
        </DropdownMenuLabel>
        {FORMAT_CONFIG.map(({ format, label, icon }) => (
          <DropdownMenuItem
            key={`page-${format}`}
            onClick={() => handleExport(format, "page")}
            className="gap-2 cursor-pointer"
          >
            {icon}
            {label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          All Records
        </DropdownMenuLabel>
        {FORMAT_CONFIG.map(({ format, label, icon }) => (
          <DropdownMenuItem
            key={`all-${format}`}
            onClick={() => handleExport(format, "all")}
            className="gap-2 cursor-pointer"
          >
            {icon}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
