"use client";

import { useState, useTransition } from "react";
import { FileScan, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scanReceipt } from "@/app/(dashboard)/vehicles/scan-receipt-action";
import type { ReceiptExtraction } from "@/lib/ai/receipt-extraction";

export function ReceiptScanPanel({
  onScanned,
}: {
  onScanned: (data: ReceiptExtraction, file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleScan() {
    if (!file) {
      setError("Choose a receipt photo or PDF first.");
      return;
    }
    setError(undefined);
    const formData = new FormData();
    formData.append("receipt", file);
    startTransition(async () => {
      const result = await scanReceipt(formData);
      if (result.success) {
        onScanned(result.data, file);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileScan className="size-5" />
          Scan a receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Upload a photo or PDF of the workshop receipt — Claude will read it and prefill the form
          below for you to review.
        </p>
        <Input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleScan} disabled={pending || !file} className="self-start">
          <Upload className="size-4" />
          {pending ? "Scanning…" : "Scan receipt"}
        </Button>
      </CardContent>
    </Card>
  );
}
