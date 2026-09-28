import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Database,
  RefreshCw,
  UserCheck,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import {
  teamUserStore,
  syncTeamUsersFromFirestore,
  addTeamUser,
  updateTeamUser,
  deleteTeamUser,
  type TeamUser,
  type UserRole,
  type UserStatus,
} from "@/lib/team-users";
import {
  departmentStore,
  syncDepartmentsFromFirestore,
  updateDepartment,
} from "@/lib/departments";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Team & Users — Noxx" },
      {
        name: "description",
        content: "Manage team users, assign them to departments/groups, set roles and permissions.",
      },
    ],
  }),
  component: UsersPage,
});

const ROLE_BADGES: Record<UserRole, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  admin: { label: "Admin", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  manager: { label: "Manager", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  agent: { label: "Support Agent", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  member: { label: "Member", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  viewer: { label: "Viewer", cls: "bg-muted text-muted-foreground border-border" },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-500" },
  away: { label: "Away", dot: "bg-amber-500" },
  offline: { label: "Offline", dot: "bg-muted-foreground" },
};

function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function avatarColor(email: string) {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let h = 0;
  for (let i = 0; i < (email || "").length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function UsersPage() {
  const teamUsers = useStore(teamUserStore);
  const departments = useStore(departmentStore);

  const [search, setSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [syncing, setSyncing] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("Noxx");
  const [formRole, setFormRole] = useState<UserRole>("agent");
  const [formStatus, setFormStatus] = useState<UserStatus>("active");
  const [formDeptIds, setFormDeptIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setSyncing(true);
      await Promise.all([syncTeamUsersFromFirestore(), syncDepartmentsFromFirestore()]);
      if (isMounted) {
        setSyncing(false);
        setDbSynced(true);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await Promise.all([syncTeamUsersFromFirestore(), syncDepartmentsFromFirestore()]);
    setSyncing(false);
    setDbSynced(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormTitle("Support Specialist");
    setFormPhone("+250 ");
    setFormCompany("Noxx");
    setFormRole("agent");
    setFormStatus("active");
    setFormDeptIds(departments.length > 0 ? [departments[0].id] : []);
    setModalOpen(true);
  };

  const openEditModal = (user: TeamUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormTitle(user.title);
    setFormPhone(user.phone || "");
    setFormCompany(user.company || "Noxx");
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormDeptIds(user.departmentIds || []);
    setModalOpen(true);
  };

  const toggleDeptSelection = (deptId: string) => {
    setFormDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    setSaving(true);
    try {
      const deptNames = departments
        .filter((d) => formDeptIds.includes(d.id))
        .map((d) => d.name);

      if (editingUser) {
        await updateTeamUser(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          title: formTitle.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          role: formRole,
          status: formStatus,
          departmentIds: formDeptIds,
          departmentNames: deptNames,
        });

        // Also update department memberIds arrays
        for (const dept of departments) {
          const isAssigned = formDeptIds.includes(dept.id);
          const currentMembers = dept.memberIds || [];
          if (isAssigned && !currentMembers.includes(editingUser.id)) {
            await updateDepartment(dept.id, { memberIds: [...currentMembers, editingUser.id] });
          } else if (!isAssigned && currentMembers.includes(editingUser.id)) {
            await updateDepartment(dept.id, {
              memberIds: currentMembers.filter((m) => m !== editingUser.id),
            });
          }
        }
      } else {
        const newUser = await addTeamUser({
          name: formName.trim(),
          email: formEmail.trim(),
          title: formTitle.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          role: formRole,
          status: formStatus,
          departmentIds: formDeptIds,
          departmentNames: deptNames,
        });

        // Add user to departments
        for (const deptId of formDeptIds) {
          const targetDept = departments.find((d) => d.id === deptId);
          if (targetDept) {
            const currentMembers = targetDept.memberIds || [];
            if (!currentMembers.includes(newUser.id)) {
              await updateDepartment(deptId, { memberIds: [...currentMembers, newUser.id] });
            }
          }
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save team user:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from team users?`)) {
      await deleteTeamUser(id);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = teamUsers;

    if (selectedDeptFilter !== "all") {
      result = result.filter((u) => u.departmentIds?.includes(selectedDeptFilter));
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          u.company?.toLowerCase().includes(q) ||
          u.departmentNames?.some((d) => d.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [teamUsers, selectedDeptFilter, search]);

  const activeCount = useMemo(() => teamUsers.filter((u) => u.status === "active").length, [teamUsers]);

  return (
    <AppLayout>
      <Topbar
        title="Users & Team Assignment"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent shadow-soft disabled:opacity-50"
              title="Sync with Firestore Database"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-primary", syncing && "animate-spin")} />
              <span>{syncing ? "Syncing..." : "Database Sync"}</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Add Team User</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Banner Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{teamUsers.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Total Team Users</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{activeCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Active Status</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{departments.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Available Depts/Groups</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground">Firestore DB</span>
                {dbSynced && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Live
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Synced & Persistent</div>
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, email, title, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Showing {filteredUsers.length} of {teamUsers.length} team members
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const roleCfg = ROLE_BADGES[user.role] || ROLE_BADGES.agent;
            const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
            const colorClass = avatarColor(user.email);

            // Get user assigned department objects
            const userDepts = departments.filter((d) => user.departmentIds?.includes(d.id));

            return (
              <Card
                key={user.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition shadow-soft group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={cn(
                            "h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-soft",
                            colorClass,
                          )}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span
                          className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-card",
                            statusCfg.dot,
                          )}
                          title={statusCfg.label}
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          {user.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{user.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition"
                        title="Edit team user"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                        title="Remove user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Role & Status */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold border",
                        roleCfg.cls,
                      )}
                    >
                      {roleCfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium bg-accent/60 px-2 py-0.5 rounded">
                      {user.company || "Noxx"}
                    </span>
                  </div>

                  {/* Assigned Departments / Groups */}
                  <div className="mt-3.5 pt-3 border-t border-border">
                    <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-primary" /> Assigned Departments:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {userDepts.length > 0 ? (
                        userDepts.map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-accent text-foreground border border-border"
                          >
                            <span className="font-bold text-primary">{d.code}</span> • {d.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          No department assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/50">
                  <span>Joined {user.joinedAt}</span>
                  <span>{user.lastActive || "Recently"}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Edit Team User" : "Add Team User"}
        subtitle="Set profile info, role, and assign to departments or groups."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name *">
              <input
                type="text"
                required
                placeholder="e.g. Kagabo Jean"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Email Address *">
              <input
                type="email"
                required
                placeholder="jean@noxxdesk.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Job Title">
              <input
                type="text"
                placeholder="e.g. Senior Support Specialist"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Phone / WhatsApp">
              <input
                type="text"
                placeholder="+250 788 000 111"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Company / Org">
              <input
                type="text"
                placeholder="Noxx"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="User Role">
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className={inputCls}
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Support Agent</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </Field>
          </div>

          {/* Department / Group Assignment Checkboxes */}
          <Field label="Assign to Departments / Groups *">
            <div className="space-y-1.5 max-h-44 overflow-y-auto border border-border rounded-lg p-2.5 bg-card">
              {departments.map((d) => {
                const checked = formDeptIds.includes(d.id);
                return (
                  <label
                    key={d.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition border",
                      checked
                        ? "bg-accent border-primary/30"
                        : "border-transparent hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDeptSelection(d.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {d.name}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1.5 py-0.2 rounded bg-muted">
                            {d.code}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Lead: {d.lead}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Field>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : editingUser ? "Save User" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
