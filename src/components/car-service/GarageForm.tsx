"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Phone, Plus, Trash2 } from "lucide-react";
import type { CreateGarageInput, Garage } from "@/types/car-service";

interface GarageFormProps {
  trigger?: React.ReactNode;
  onAdd: (input: CreateGarageInput) => Promise<Garage>;
  isLoading?: boolean;
}

export function GarageForm({ trigger, onAdd, isLoading }: GarageFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  function addPhone() {
    setPhones((prev) => [...prev, ""]);
  }

  function setPhone(i: number, val: string) {
    setPhones((prev) => prev.map((p, idx) => (idx === i ? val : p)));
  }

  function removePhone(i: number) {
    setPhones((prev) => prev.filter((_, idx) => idx !== i));
  }

  function reset() {
    setName("");
    setMapsUrl("");
    setPhones([""]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        mapsUrl: mapsUrl.trim() || undefined,
        phones: phones.map((p) => p.trim()).filter(Boolean),
      });
      setOpen(false);
      reset();
    } catch {
      // error handled by mutation
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || isLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) { setOpen(v); if (!v) reset(); }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> เพิ่มอู่ใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มอู่ / สถานที่ซ่อม</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>ชื่อสถานที่ *</Label>
            <Input
              placeholder="เช่น อู่ช่างสมชาย, Toyota Service Center"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              เบอร์โทรศัพท์
            </Label>
            {phones.map((phone, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="tel"
                  placeholder={`เบอร์ที่ ${i + 1}`}
                  value={phone}
                  onChange={(e) => setPhone(i, e.target.value)}
                  className="flex-1"
                />
                {phones.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removePhone(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {phones.length < 5 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-7 text-muted-foreground"
                onClick={addPhone}
              >
                <Plus className="h-3 w-3" /> เพิ่มเบอร์
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => { setOpen(false); reset(); }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
