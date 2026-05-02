"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useCarWashPlaces } from "@/hooks/useCarWashPlaces";
import type {
  CarWashPlace,
  CreateCarWashPlaceInput,
  WashServiceType,
} from "@/types/car-service";
import { WASH_SERVICE_TYPE_LABELS } from "@/types/car-service";

// ---- Form dialog (create / edit) ----

interface PlaceFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: CarWashPlace;
  onSave: (input: CreateCarWashPlaceInput) => Promise<void>;
  isSaving: boolean;
}

function PlaceFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  isSaving,
}: PlaceFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mapsUrl, setMapsUrl] = useState(initial?.mapsUrl ?? "");
  const [serviceType, setServiceType] = useState<WashServiceType>(
    initial?.serviceType ?? "full_service",
  );

  function reset() {
    setName(initial?.name ?? "");
    setMapsUrl(initial?.mapsUrl ?? "");
    setServiceType(initial?.serviceType ?? "full_service");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      mapsUrl: mapsUrl.trim() || undefined,
      serviceType,
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isSaving) {
          onOpenChange(v);
          if (!v) reset();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {initial ? "แก้ไขสถานที่ล้างรถ" : "เพิ่มสถานที่ล้างรถ"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>ชื่อสถานที่ *</Label>
            <Input
              placeholder="เช่น ร้านล้างรถสยาม, Shell Select หน้าบ้าน"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>ประเภทบริการ *</Label>
            <Select
              value={serviceType}
              onValueChange={(v) => setServiceType(v as WashServiceType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(WASH_SERVICE_TYPE_LABELS) as [WashServiceType, string][]).map(
                  ([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Google Maps URL
            </Label>
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-1.5">
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main selector ----

interface CarWashPlaceSelectorProps {
  value: string;
  onChange: (id: string, description: string) => void;
}

export function CarWashPlaceSelector({
  value,
  onChange,
}: CarWashPlaceSelectorProps) {
  const { places, isLoading, addPlace, updatePlace, removePlace, isAdding, isUpdating } =
    useCarWashPlaces();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CarWashPlace | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarWashPlace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedPlace = places.find((p) => p.id === value);

  function buildDescription(place: CarWashPlace) {
    return `${place.name} · ${WASH_SERVICE_TYPE_LABELS[place.serviceType]}`;
  }

  async function handleCreate(input: CreateCarWashPlaceInput) {
    const place = await addPlace(input);
    onChange(place.id, buildDescription(place));
  }

  async function handleEdit(input: CreateCarWashPlaceInput) {
    if (!editTarget) return;
    const updated = await updatePlace(editTarget.id, input);
    if (value === editTarget.id) {
      onChange(updated.id, buildDescription(updated));
    }
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await removePlace(deleteTarget.id);
      if (value === deleteTarget.id) onChange("", "");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={(id) => {
            const place = places.find((p) => p.id === id);
            if (place) onChange(id, buildDescription(place));
            else onChange("", "");
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={
                isLoading ? "กำลังโหลด..." : "เลือกสถานที่ล้างรถ"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {places.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span>{p.name}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {WASH_SERVICE_TYPE_LABELS[p.serviceType]}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          + สถานที่ใหม่
        </button>
      </div>

      {selectedPlace && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <div className="flex-1 min-w-0">
            <span className="font-medium">{selectedPlace.name}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {WASH_SERVICE_TYPE_LABELS[selectedPlace.serviceType]}
            </Badge>
            {selectedPlace.mapsUrl && (
              <a
                href={selectedPlace.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-0.5 text-xs text-blue-500 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                แผนที่
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditTarget(selectedPlace)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(selectedPlace)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Create dialog */}
      <PlaceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreate}
        isSaving={isAdding}
      />

      {/* Edit dialog */}
      <PlaceFormDialog
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        initial={editTarget ?? undefined}
        onSave={handleEdit}
        isSaving={isUpdating}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v && !isDeleting) setDeleteTarget(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ลบสถานที่</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ต้องการลบ <span className="font-semibold text-foreground">{deleteTarget?.name}</span> ออกจากรายการ?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              className="gap-1.5"
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              ลบ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
