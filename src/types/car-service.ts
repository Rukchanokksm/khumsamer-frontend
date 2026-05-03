export type ServiceType =
  | "oil_change"
  | "tire_rotation"
  | "brake_service"
  | "battery"
  | "filter"
  | "inspection"
  | "repair"
  | "other";

export interface CarService {
  id: string;
  carName: string;
  licensePlate: string;
  serviceType: ServiceType;
  serviceDate: string;
  mileage: number;
  cost: number;
  garage?: string;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCarServiceInput = Omit<CarService, "id" | "createdAt" | "updatedAt">;
export type UpdateCarServiceInput = Partial<CreateCarServiceInput>;

// ---- Expenses ----
export type ExpenseCategory =
  | "fuel"
  | "parking"
  | "toll"
  | "insurance"
  | "tax"
  | "wash"
  | "accessories"
  | "other";

export type TravelExpenseCategory =
  | "fuel"
  | "toll"
  | "parking"
  | "accommodation"
  | "food"
  | "ferry"
  | "other";

export interface CarExpense {
  id: string;
  carName: string;
  licensePlate: string;
  category: ExpenseCategory;
  amount: number; // THB
  date: string;
  description: string;
  liters?: number;
  pricePerLiter?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelExpense {
  id: string;
  tripName: string;
  carName: string;
  licensePlate: string;
  category: TravelExpenseCategory;
  amount: number; // THB
  date: string;
  description: string;
  liters?: number;
  pricePerLiter?: number;
  distance?: number; // km
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCarExpenseInput = Omit<CarExpense, "id" | "createdAt" | "updatedAt">;
export type UpdateCarExpenseInput = Partial<CreateCarExpenseInput>;
export type CreateTravelExpenseInput = Omit<TravelExpense, "id" | "createdAt" | "updatedAt">;
export type UpdateTravelExpenseInput = Partial<CreateTravelExpenseInput>;

// ---- Vehicles ----
export type VehicleType = "sedan" | "pickup" | "ppv" | "suv" | "hatchback" | "other";
export type VehicleCondition = "new" | "used";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  type?: VehicleType;
  color?: string;
  condition?: VehicleCondition;
  purchaseDate?: number; // Unix timestamp (seconds)
  createdAt: string;
  updatedAt: string;
}

export type CreateVehicleInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
export type UpdateVehicleInput = Partial<CreateVehicleInput>;

// ---- Garage (สถานที่ซ่อม) ----
export interface Garage {
  id: string;
  name: string;
  mapsUrl?: string;
  phones: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateGarageInput = Pick<Garage, "name" | "mapsUrl" | "phones">;
export type UpdateGarageInput = Partial<CreateGarageInput>;

// ---- Car Repair ----
export type RepairType =
  | "oil_change"
  | "tire"
  | "brake"
  | "battery"
  | "filter"
  | "inspection"
  | "body_repair"
  | "electrical"
  | "ac"
  | "transmission"
  | "wash"
  | "other";

export interface CarRepair {
  id: string;
  carName: string;
  licensePlate: string;
  repairType: RepairType;
  date: string;
  cost: number;
  description: string;
  notes?: string;
  garageId?: string;
  garage?: Pick<Garage, "id" | "name" | "mapsUrl" | "phones">;
  receiptUrl?: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarRepairInput {
  carName: string;
  licensePlate: string;
  repairType: RepairType;
  date: string;
  cost: number;
  description: string;
  notes?: string;
  garageId?: string | null;
}

export type UpdateCarRepairInput = Partial<CreateCarRepairInput>;

// ---- Car Wash Place (สถานที่ล้างรถ) ----
export type WashServiceType = "self" | "full_service";

export const WASH_SERVICE_TYPE_LABELS: Record<WashServiceType, string> = {
  self: "ล้างเอง",
  full_service: "ฝากล้าง",
};

export interface CarWashPlace {
  id: string;
  name: string;
  mapsUrl?: string;
  serviceType: WashServiceType;
  createdAt: string;
  updatedAt: string;
}

export type CreateCarWashPlaceInput = {
  name: string;
  mapsUrl?: string;
  serviceType: WashServiceType;
};
export type UpdateCarWashPlaceInput = Partial<CreateCarWashPlaceInput>;

// ---- Gas Price ----
export interface FuelPrice {
  fuelType: string;
  pricePerLiter: number; // THB
  change: number; // +/- from previous day
}

export interface GasPriceData {
  station: string;
  date: string;
  prices: FuelPrice[];
  lastUpdated: string;
}
