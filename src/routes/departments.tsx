import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Plus,
  Search,
  Users,
  UserCheck,
  ShieldCheck,
  Edit2,
  Trash2,
  Headphones,
  Code,
  Briefcase,
  Receipt,
  Layers,
  Database,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import {
  departmentStore,
  syncDepartmentsFromFirestore,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  type Department,
} from "@/lib/departments";
import { teamUserStore, syncTeamUsersFromFirestore, type TeamUser } from "@/lib/team-users";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments & Groups — Noxx" },
      {
        name: "description",
        content: "Manage company departments, teams, assign leaders, and organize ticket routing.",
      },
    ],
  }),
  component: DepartmentsPage,
});

const ICON_MAP: Record<string, any> = {
  Headphones,
  Code,
  Briefcase,
  Receipt,
  Building2,
  Layers,
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-500 dark:text-violet-400",
    border: "border-violet-500/20",
    badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-500 dark:text-rose-400",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500 dark:text-cyan-400",
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
};

function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function DepartmentsPage() {
  const departments = useStore(departmentStore);
  const teamUsers = useStore(teamUserStore);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLead, setFormLead] = useState("");
  const [formColor, setFormColor] = useState("blue");
  const [formMembers, setFormMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Sync with Firestore database on load
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setSyncing(true);
      await Promise.all([syncDepartmentsFromFirestore(), syncTeamUsersFromFirestore()]);
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
    await Promise.all([syncDepartmentsFromFirestore(), syncTeamUsersFromFirestore()]);
    setSyncing(false);
    setDbSynced(true);
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setFormName("");
    setFormCode("");
    setFormDesc("");
    setFormLead(teamUsers[0]?.name || "");
    setFormColor("blue");
    setFormMembers([]);
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormDesc(dept.description);
    setFormLead(dept.lead);
    setFormColor(dept.color || "blue");
    setFormMembers(dept.memberIds || []);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;
    setSaving(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, {
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          description: formDesc.trim(),
          lead: formLead,
          color: formColor,
          memberIds: formMembers,
        });
      } else {
        await addDepartment({
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          description: formDesc.trim(),
          lead: formLead,
          color: formColor,
          memberIds: formMembers,
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save department:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the "${name}" department?`)) {
      await deleteDepartment(id);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setFormMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const filteredDepts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.lead.toLowerCase().includes(q),
    );
  }, [departments, search]);

  const totalMembersAssigned = useMemo(() => {
    const set = new Set<string>();
    departments.forEach((d) => d.memberIds?.forEach((m) => set.add(m)));
    return set.size;
  }, [departments]);

  return (
    <AppLayout>
      <Topbar
        title="Departments & Groups"
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
              <span>New Department</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Banner Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{departments.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Active Departments</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalMembersAssigned}</div>
              <div className="text-xs text-muted-foreground font-medium">Assigned Team Users</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-accent/20 border-border">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {new Set(departments.map((d) => d.lead)).size}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Department Leads</div>
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
              <div className="text-xs text-muted-foreground font-medium">Saved & Synchronized</div>
            </div>
          </Card>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search departments or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft"
            />
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            Showing {filteredDepts.length} of {departments.length} departments
          </div>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDepts.map((dept) => {
            const colorCfg = COLOR_CLASSES[dept.color] || COLOR_CLASSES.blue;
            const IconComp = ICON_MAP[dept.icon || ""] || Building2;
            const assignedUsers = teamUsers.filter((u) => dept.memberIds?.includes(u.id));

            return (
              <Card
                key={dept.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition shadow-soft group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                          colorCfg.bg,
                          colorCfg.text,
                          colorCfg.border,
                        )}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-sm">{dept.name}</h3>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border",
                              colorCfg.badge,
                            )}
                          >
                            {dept.code}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {dept.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition"
                        title="Edit department"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                        title="Delete department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Department Lead */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                        {getInitials(dept.lead)}
                      </div>
                      <span className="text-muted-foreground">
                        Lead: <strong className="text-foreground font-medium">{dept.lead}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium bg-accent/50 px-2 py-0.5 rounded">
                      {assignedUsers.length} members
                    </span>
                  </div>

                  {/* Assigned Team Members Avatars */}
                  <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[11px] text-muted-foreground mr-1">Team:</span>
                    {assignedUsers.length > 0 ? (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {assignedUsers.slice(0, 5).map((u) => (
                          <div
                            key={u.id}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[9px] font-bold text-foreground"
                            title={`${u.name} (${u.title})`}
                          >
                            {getInitials(u.name)}
                          </div>
                        ))}
                        {assignedUsers.length > 5 && (
                          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-card bg-accent flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                            +{assignedUsers.length - 5}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        No team members assigned yet
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Department Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? "Edit Department" : "Create New Department"}
        subtitle="Manage department code, head lead, color badge, and assign team users."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department Name *">
              <input
                type="text"
                required
                placeholder="e.g. Technical Support"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Department Code *">
              <input
                type="text"
                required
                placeholder="e.g. SUPP"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={2}
              placeholder="Describe department responsibilities and domain..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Department Lead / Head">
              <select
                value={formLead}
                onChange={(e) => setFormLead(e.target.value)}
                className={inputCls}
              >
                {teamUsers.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Theme Color">
              <select
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className={inputCls}
              >
                <option value="blue">Blue (Support / Ops)</option>
                <option value="violet">Violet (Engineering)</option>
                <option value="emerald">Emerald (Sales / Growth)</option>
                <option value="amber">Amber (Finance / Billing)</option>
                <option value="rose">Rose (Executive)</option>
                <option value="cyan">Cyan (Product)</option>
              </select>
            </Field>
          </div>

          {/* Assign Team Members Checkboxes */}
          <Field label="Assign Team Members to Department">
            <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1 bg-card">
              {teamUsers.map((u) => {
                const checked = formMembers.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition",
                      checked ? "bg-accent/70 border border-primary/20" : "hover:bg-accent/30",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMemberSelection(u.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-[10px] text-muted-foreground">{u.title}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {u.company || "Noxx"}
                    </span>
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
              {saving ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
