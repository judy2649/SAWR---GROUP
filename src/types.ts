export type PropertyType = "Residential" | "Commercial" | "Industrial";
export type UnitStatus = "Vacant" | "Occupied" | "Maintenance" | "Reserved";
export type MaintenanceStatus = "Pending" | "In Progress" | "Completed" | "Deferred";
export type MaintenancePriority = "Low" | "Medium" | "High" | "Emergency";
export type TransactionCategory = "Income" | "Expense";
export type TransactionType = "Rent" | "Deposit" | "Maintenance" | "Utility" | "Service Charge" | "Other";
export type PaymentMethod = "M-PESA" | "Bank Transfer" | "Cash" | "Cheque";
export type CommunicationType = "SMS" | "Email" | "In-App";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  imageUrl?: string;
  ownerId: string;
  createdAt: string;
  totalUnits: number;
  vacantUnits: number;
  buyPrice?: number;
  rentPrice?: number;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  rentAmount: number;
  status: UnitStatus;
  tenantId?: string;
  features?: string[];
  lastMaintenanceDate?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  onboardingDate: string;
  status: "Active" | "Inactive" | "Notice";
}

export interface Lease {
  id: string;
  tenantId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: "Draft" | "Review" | "E-Signature Pending" | "Active" | "Expired" | "Terminated";
  documentUrl?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  date: string;
  unitId?: string;
  tenantId?: string;
  description: string;
  isAutoMatched?: boolean;
}

export interface MaintenanceRequest {
  id: string;
  unitId: string;
  propertyId: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  cost?: number;
  vendorId?: string;
  photos?: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface CommunicationLog {
  id: string;
  recipientId: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  status: "Sent" | "Delivered" | "Failed";
  timestamp: string;
}

export interface Vendor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
}
