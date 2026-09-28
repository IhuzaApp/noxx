import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { createStore } from "./store";

export type UserRole = "owner" | "admin" | "manager" | "agent" | "member" | "viewer";
export type UserStatus = "active" | "away" | "offline";

export type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentIds: string[]; // Department / Group IDs user belongs to
  departmentNames?: string[];
  avatar?: string;
  phone?: string;
  title: string;
  company?: string;
  joinedAt: string;
  lastActive?: string;
};

export const defaultTeamUsers: TeamUser[] = [
  {
    id: "usr_1",
    name: "Kagabo Jean",
    email: "jean@noxxdesk.com",
    role: "admin",
    status: "active",
    departmentIds: ["dept_support"],
    departmentNames: ["Customer Support"],
    title: "Lead Support Operations",
    phone: "+250 788 111 222",
    company: "Noxx",
    joinedAt: "6 months ago",
    lastActive: "Active now",
  },
  {
    id: "usr_2",
    name: "Amara Osei",
    email: "amara@officeats.co",
    role: "manager",
    status: "active",
    departmentIds: ["dept_support", "dept_engineering"],
    departmentNames: ["Customer Support", "Engineering & Tech"],
    title: "Head of Integrations",
    phone: "+250 788 333 444",
    company: "Officeats",
    joinedAt: "4 months ago",
    lastActive: "5m ago",
  },
  {
    id: "usr_3",
    name: "Uwase Chantal",
    email: "chantal@candidigital.com",
    role: "agent",
    status: "active",
    departmentIds: ["dept_engineering"],
    departmentNames: ["Engineering & Tech"],
    title: "Senior Integration Engineer",
    phone: "+250 788 123 456",
    company: "Candi Digital",
    joinedAt: "2 months ago",
    lastActive: "15m ago",
  },
  {
    id: "usr_4",
    name: "Kamikazi Diane",
    email: "diane@noxxdesk.com",
    role: "agent",
    status: "away",
    departmentIds: ["dept_support", "dept_sales"],
    departmentNames: ["Customer Support", "Sales & Account Mgmt"],
    title: "Customer Success Manager",
    phone: "+250 733 987 654",
    company: "Noxx",
    joinedAt: "5 months ago",
    lastActive: "1h ago",
  },
  {
    id: "usr_5",
    name: "Ineza Bella",
    email: "bella@noxxdesk.com",
    role: "member",
    status: "active",
    departmentIds: ["dept_sales", "dept_billing"],
    departmentNames: ["Sales & Account Mgmt", "Finance & Operations"],
    title: "Billing & Accounts Lead",
    phone: "+250 722 111 222",
    company: "Noxx",
    joinedAt: "3 months ago",
    lastActive: "22m ago",
  },
  {
    id: "usr_6",
    name: "Mugisha Patrick",
    email: "patrick@officeats.co",
    role: "agent",
    status: "active",
    departmentIds: ["dept_support"],
    departmentNames: ["Customer Support"],
    title: "AI Flow Supervisor",
    phone: "+250 788 555 666",
    company: "Officeats",
    joinedAt: "1 month ago",
    lastActive: "just now",
  },
];

const STORAGE_KEY = "noxx_team_users_data";
function loadInitialTeamUsers(): TeamUser[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading team users from localStorage:", e);
  }
  return defaultTeamUsers;
}

export const teamUserStore = createStore<TeamUser>(loadInitialTeamUsers());

teamUserStore.subscribe(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamUserStore.get()));
  } catch (e) {
    console.error("Error saving team users to localStorage:", e);
  }
});

const TEAM_USERS_COLLECTION = "team_users";

export async function syncTeamUsersFromFirestore(): Promise<TeamUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, TEAM_USERS_COLLECTION));
    if (!querySnapshot.empty) {
      const fetched: TeamUser[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...(docSnap.data() as Omit<TeamUser, "id">) });
      });
      teamUserStore.set(fetched);
      return fetched;
    } else {
      for (const u of defaultTeamUsers) {
        await setDoc(doc(db, TEAM_USERS_COLLECTION, u.id), u);
      }
      return defaultTeamUsers;
    }
  } catch (e) {
    console.warn("Firestore sync for team users failed or offline, falling back to store:", e);
    return teamUserStore.get();
  }
}

export async function addTeamUser(user: Omit<TeamUser, "id" | "joinedAt">): Promise<TeamUser> {
  const newUser: TeamUser = {
    ...user,
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    joinedAt: "Just now",
    lastActive: "Just now",
  };
  teamUserStore.add(newUser);
  try {
    await setDoc(doc(db, TEAM_USERS_COLLECTION, newUser.id), newUser);
  } catch (e) {
    console.warn("Firestore add user error:", e);
  }
  return newUser;
}

export async function updateTeamUser(id: string, patch: Partial<TeamUser>): Promise<void> {
  teamUserStore.update((u) => u.id === id, patch);
  try {
    await setDoc(doc(db, TEAM_USERS_COLLECTION, id), patch, { merge: true });
  } catch (e) {
    console.warn("Firestore update user error:", e);
  }
}

export async function deleteTeamUser(id: string): Promise<void> {
  teamUserStore.remove((u) => u.id === id);
  try {
    await deleteDoc(doc(db, TEAM_USERS_COLLECTION, id));
  } catch (e) {
    console.warn("Firestore delete user error:", e);
  }
}
