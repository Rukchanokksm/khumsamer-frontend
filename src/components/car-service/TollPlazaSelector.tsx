"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MapPin } from "lucide-react"
import {
    TOLL_HIGHWAYS,
    TOLL_PLAZAS,
    getGoogleMapsUrl,
    type TollPlaza,
} from "@/data/toll-plazas"

interface TollPlazaSelectorProps {
    value: string
    onChange: (id: string, description: string) => void
}

function buildDescription(plaza: TollPlaza): string {
    const highway = TOLL_HIGHWAYS.find((h) => h.id === plaza.highwayId)
    return `${highway?.nameShort ?? plaza.highwayId} · ${plaza.name}`
}

export function TollPlazaSelector({ value, onChange }: TollPlazaSelectorProps) {
    const [selectedHighwayId, setSelectedHighwayId] = useState(() => {
        if (!value) return ""
        return TOLL_PLAZAS.find((p) => String(p.id) === value)?.highwayId ?? ""
    })

    useEffect(() => {
        if (!value) setSelectedHighwayId("")
    }, [value])

    const filteredPlazas = useMemo(
        () => TOLL_PLAZAS.filter((p) => p.highwayId === selectedHighwayId),
        [selectedHighwayId],
    )

    const selectedPlaza = value ? TOLL_PLAZAS.find((p) => String(p.id) === value) : null
    const selectedHighway = TOLL_HIGHWAYS.find((h) => h.id === selectedHighwayId)

    function handleHighwayChange(hwId: string) {
        setSelectedHighwayId(hwId)
        onChange("", "")
    }

    function handlePlazaChange(plazaId: string) {
        const plaza = TOLL_PLAZAS.find((p) => String(p.id) === plazaId)
        if (plaza) onChange(plazaId, buildDescription(plaza))
        else onChange("", "")
    }

    return (
        <div className="space-y-2">
            <Select value={selectedHighwayId} onValueChange={handleHighwayChange}>
                <SelectTrigger>
                    <SelectValue placeholder="เลือกสายทาง" />
                </SelectTrigger>
                <SelectContent>
                    {TOLL_HIGHWAYS.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                            <div className="flex items-center gap-2">
                                <span>{h.nameShort}</span>
                                <Badge variant="secondary" className="px-1 py-0 text-xs">
                                    {h.operator}
                                </Badge>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedHighwayId && (
                <Select value={value} onValueChange={handlePlazaChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกด่าน" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredPlazas.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {selectedPlaza && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{selectedPlaza.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                        {selectedHighway?.nameShort}
                    </span>
                    <a
                        href={getGoogleMapsUrl(selectedPlaza)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex shrink-0 items-center gap-0.5 text-xs text-blue-500 hover:underline"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Maps
                    </a>
                </div>
            )}
        </div>
    )
}
