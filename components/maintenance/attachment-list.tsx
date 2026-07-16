import Image from "next/image";
import { FileText } from "lucide-react";
import type { MaintenanceAttachment } from "@/types/supabase";

export function AttachmentList({
  attachments,
}: {
  attachments: Array<MaintenanceAttachment & { url: string | null }>;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {attachments.map((attachment) =>
        attachment.url ? (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex size-24 items-center justify-center overflow-hidden rounded-lg border bg-muted"
          >
            {attachment.file_type === "image" ? (
              <Image
                src={attachment.url}
                alt={attachment.file_name}
                fill
                className="object-cover transition-opacity group-hover:opacity-80"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 p-2 text-center">
                <FileText className="size-6 text-muted-foreground" />
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {attachment.file_name}
                </span>
              </div>
            )}
          </a>
        ) : null
      )}
    </div>
  );
}
