import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { createStore } from "./store";

export type Department = {
  id: string;
  name: string;
  code: string; // e.g. SUPP, ENG, SALES, FIN
  description: string;
  lead: string; // Name or Email of department head
  leadEmail?: string;
  color: string; // e.g. "emerald", "blue", "violet", "amber", "pink", "rose"
  icon?: string;
  memberIds: string[]; // User IDs assigned to this department
  createdAt: string;
  updatedAt: string;
};

export const defaultDepartments: Department[] = [
  {
    id: "dept_support",
    name: "Customer Support",
    code: "SUPP",
    description: "Frontline customer service, ticket routing, and AI escalation management.",
    lead: "Kagabo Jean",
    leadEmail: "jean@noxxdesk.com",
    color: "blue",
    icon: "Headphones",
    memberIds: ["usr_1", "usr_2", "usr_4", "usr_6"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dept_engineering",
    name: "Engineering & Tech",
    code: "ENG",
    description: "API integrations, flow logic, backend services, and webhook maintenance.",
    lead: "Amara Osei",
    leadEmail: "amara@officeats.co",
    color: "violet",
    icon: "Code",
    memberIds: ["usr_2", "usr_3"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dept_sales",
    name: "Sales & Account Mgmt",
    code: "SALES",
    description: "Client onboarding, retainer contracts, enterprise upgrades, and CRM sync.",
    lead: "Kamikazi Diane",
    leadEmail: "diane@noxxdesk.com",
    color: "emerald",
    icon: "Briefcase",
    memberIds: ["usr_4", "usr_5"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dept_billing",
    name: "Finance & Operations",
    code: "FIN",
    description: "Invoicing, payment links, subscription renewals, and BK card processing.",
    lead: "Ineza Bella",
    leadEmail: "bella@noxxdesk.com",
    color: "amber",
    icon: "Receipt",
    memberIds: ["usr_5"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = "noxx_departments_data";
function loadInitialDepartments(): Department[] {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading departments from localStorage:", e);
  }
  return defaultDepartments;
}

export const departmentStore = createStore<Department>(loadInitialDepartments());

departmentStore.subscribe(() => {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departmentStore.get()));
    }
  } catch (e) {
    console.error("Error saving departments to localStorage:", e);
  }
});

const DEPARTMENTS_COLLECTION = "departments";

export async function syncDepartmentsFromFirestore(): Promise<Department[]> {
  try {
    const querySnapshot = await getDocs(collection(db, DEPARTMENTS_COLLECTION));
    if (!querySnapshot.empty) {
      const fetched: Department[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...(docSnap.data() as Omit<Department, "id">) });
      });
      departmentStore.set(fetched);
      return fetched;
    } else {
      for (const dept of defaultDepartments) {
        await setDoc(doc(db, DEPARTMENTS_COLLECTION, dept.id), dept);
      }
      return defaultDepartments;
    }
  } catch (e) {
    console.warn("Firestore sync for departments failed or offline, falling back to store:", e);
    return departmentStore.get();
  }
}

export async function addDepartment(
  dept: Omit<Department, "id" | "createdAt" | "updatedAt">,
): Promise<Department> {
  const newDept: Department = {
    ...dept,
    id: `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  departmentStore.add(newDept);
  try {
    await setDoc(doc(db, DEPARTMENTS_COLLECTION, newDept.id), newDept);
  } catch (e) {
    console.warn("Firestore add department error:", e);
  }
  return newDept;
}

export async function updateDepartment(id: string, patch: Partial<Department>): Promise<void> {
  const updatedPatch = { ...patch, updatedAt: new Date().toISOString() };
  departmentStore.update((d) => d.id === id, updatedPatch);
  try {
    await setDoc(doc(db, DEPARTMENTS_COLLECTION, id), updatedPatch, { merge: true });
  } catch (e) {
    console.warn("Firestore update department error:", e);
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  departmentStore.remove((d) => d.id === id);
  try {
    await deleteDoc(doc(db, DEPARTMENTS_COLLECTION, id));
  } catch (e) {
    console.warn("Firestore delete department error:", e);
  }
}
