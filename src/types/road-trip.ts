export interface RoadTrip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  distanceKm?: number;
  totalCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRoadTripInput = Omit<RoadTrip, "id" | "createdAt" | "updatedAt">;
export type UpdateRoadTripInput = Partial<CreateRoadTripInput>;
