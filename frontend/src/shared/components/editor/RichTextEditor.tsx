import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/shared/utils/cn";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  error?: boolean;
}

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "align",
  "link",
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your advertisement content here…",
  className,
  readOnly = false,
  error = false,
}: RichTextEditorProps) {
  const modules = useMemo(() => MODULES, []);

  return (
    <div
      className={cn(
        "rounded-md overflow-hidden",
        error && "ring-2 ring-destructive",
        className
      )}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}