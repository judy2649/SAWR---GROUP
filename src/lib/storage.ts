export interface Property {
  id: string;
  name: string;
  address: string;
  type: string; // "Residential" | "Commercial"
  units: number;
  occupancy: number; // percentage
  revenue: number;
  image: string;
  rentPrice?: number;
  buyPrice?: number;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  rent: number;
  status: string; // "Active" | "Warning" | "Inactive"
}

export interface Lease {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  start: string;
  end: string;
  status: string; // "Active" | "Expiring" | "Draft" | "Expired"
  risk: string; // "Low" | "Medium" | "High" | "N/A"
}

export interface VacancyUnit {
  id: string;
  property: string;
  unit: string;
  type: string;
  daysOnMarket: number;
  marketRent: number;
  status: string; // "Ready" | "Listed" | "Maintenance" | "Cleaning"
  leads: number;
}

export interface Expense {
  id: string;
  property: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  status: string; // "Paid" | "Pending" | "Overdue"
}

export interface MaintenanceTask {
  id: string;
  title: string;
  property: string;
  priority: string; // "Low" | "Medium" | "High" | "Emergency"
  status: string; // "Pending" | "In Progress" | "Completed"
  date: string;
  vendor: string;
}

export interface CommLog {
  id: string;
  recipientId: string;
  type: string; // "SMS" | "Email" | "In-App"
  subject?: string;
  content: string;
  status: string; // "Delivered" | "Sent" | "Failed"
  timestamp: string;
}

// Low-level getter/setter with fallback to completely EMPTY arrays to fulfill user intent of only displaying admin entries
export function getSavedItem<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(`sawr_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error loading ${key} from storage`, e);
    return [];
  }
}

export function saveItem<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(`sawr_${key}`, JSON.stringify(items));
    // Trigger storage event so other components on same page can listen to shifts
    window.dispatchEvent(new Event("sawr_data_update"));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

// Pre-packaged API methods
export const StorageEngine = {
  getProperties: () => getSavedItem<Property>("properties"),
  saveProperties: (items: Property[]) => saveItem<Property>("properties", items),

  getTenants: () => getSavedItem<Tenant>("tenants"),
  saveTenants: (items: Tenant[]) => saveItem<Tenant>("tenants", items),

  getLeases: () => getSavedItem<Lease>("leases"),
  saveLeases: (items: Lease[]) => saveItem<Lease>("leases", items),

  getVacancyUnits: () => getSavedItem<VacancyUnit>("vacancy_units"),
  saveVacancyUnits: (items: VacancyUnit[]) => saveItem<VacancyUnit>("vacancy_units", items),

  getExpenses: () => getSavedItem<Expense>("expenses"),
  saveExpenses: (items: Expense[]) => saveItem<Expense>("expenses", items),

  getMaintenanceTasks: () => getSavedItem<MaintenanceTask>("maintenance_tasks"),
  saveMaintenanceTasks: (items: MaintenanceTask[]) => saveItem<MaintenanceTask>("maintenance_tasks", items),

  getCommLogs: () => getSavedItem<CommLog>("comm_logs"),
  saveCommLogs: (items: CommLog[]) => saveItem<CommLog>("comm_logs", items),
};
