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
export type CreateTravelExpenseInput = Omit<TravelExpense, "id" | "createdAt" | "updatedAt">;

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
