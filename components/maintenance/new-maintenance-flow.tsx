"use client";

import { useState } from "react";
import { FileScan, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { ReceiptScanPanel } from "@/components/maintenance/receipt-scan-panel";
import { createMaintenanceRecord } from "@/app/(dashboard)/vehicles/maintenance-actions";
import type { ReceiptExtraction } from "@/lib/ai/receipt-extraction";

type Mode = "choose" | "scan" | "form";

export function NewMaintenanceFlow({ vehicleId }: { vehicleId: string }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [prefill, setPrefill] = useState<ReceiptExtraction | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  if (mode === "choose") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add maintenance record</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 h-auto flex-col gap-2 py-6" onClick={() => setMode("scan")}>
            <FileScan className="size-6" />
            Scan a receipt
          </Button>
          <Button variant="outline" className="flex-1 h-auto flex-col gap-2 py-6" onClick={() => setMode("form")}>
            <PenLine className="size-6" />
            Enter manually
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === "scan") {
    return (
      <ReceiptScanPanel
        onScanned={(data, file) => {
          setPrefill(data);
          setReceiptFile(file);
          setMode("form");
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add maintenance record</CardTitle>
      </CardHeader>
      <CardContent>
        <MaintenanceForm
          action={createMaintenanceRecord.bind(null, vehicleId)}
          prefill={prefill}
          initialAttachment={receiptFile}
          submitLabel="Add record"
        />
      </CardContent>
    </Card>
  );
}
