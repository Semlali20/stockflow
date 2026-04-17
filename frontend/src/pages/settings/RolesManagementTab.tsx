// frontend/src/pages/settings/RolesManagementTab.tsx

import { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Shield, ShieldCheck, Plus, Edit2, Trash2, Check,
  X as XIcon, Loader2, RefreshCw, Users, ChevronDown,
  ChevronRight, Lock,
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from 'react-hot-toast';
import { confirmDelete } from '@/utils/confirmDialog';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

// ─── Backend DTOs ─────────────────────────────────────────────────────────────

interface BackendPermission {
  id: string;
  name: string;
  description?: string;
  category?: string;
  resourceType?: string;
  isSystem?: boolean;
}

interface BackendRole {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  isActive?: boolean;
  permissions: BackendPermission[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCategory = (cat: string) =>
  cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const formatPermLabel = (perm: BackendPermission): string => {
  if (perm.description) return perm.description;
  // "user:create:all" → "Create (All)"
  const parts = perm.name.split(':');
  return parts
    .slice(1)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN:            'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  MANAGER:          'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  WAREHOUSE_MANAGER:'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
  SUPERVISOR:       'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  OPERATOR:         'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  PROCUREMENT:      'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  AUDITOR:          'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  USER:             'bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600',
};

const getRoleColor = (name: string) =>
  ROLE_COLORS[name.toUpperCase()] ??
  'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';

// ─── Create / Edit Role Modal ─────────────────────────────────────────────────

interface RoleFormModalProps {
  role?: BackendRole;
  allPermissions: BackendPermission[];
  onClose: () => void;
  onSaved: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translateCategory = (cat: string, t: any): string => {
  const key = cat.toLowerCase();
  const tKey = `settings.roles.categories.${key}`;
  const translated = t(tKey);
  return translated === tKey ? formatCategory(cat) : translated;
};

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  role, allPermissions, onClose, onSaved,
}) => {
  const { t } = useTranslation();
  const isEdit = !!role;
  const [name, setName]               = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(role?.permissions.map(p => p.id) ?? []),
  );
  const [loading, setLoading]           = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Group permissions by category, sorted alphabetically
  const grouped = useMemo<[string, BackendPermission[]][]>(() => {
    const g: Record<string, BackendPermission[]> = {};
    allPermissions.forEach(p => {
      const cat = p.category || 'Other';
      (g[cat] = g[cat] || []).push(p);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const togglePerm = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCategory = (perms: BackendPermission[]) =>
    setSelectedIds(prev => {
      const next  = new Set(prev);
      const allOn = perms.every(p => next.has(p.id));
      perms.forEach(p => (allOn ? next.delete(p.id) : next.add(p.id)));
      return next;
    });

  const toggleExpand = (cat: string) =>
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const handleSubmit = async () => {
    if (!name.trim() && !(isEdit && role?.isSystem)) {
      toast.error('Role name is required');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && role?.isSystem) {
        // System roles: use dedicated permission endpoints (PUT is blocked by backend)
        const currentIds = new Set(role.permissions.map(p => p.id));
        const toAdd    = [...selectedIds].filter(id => !currentIds.has(id));
        const toRemove = [...currentIds].filter(id => !selectedIds.has(id));

        // Add new permissions
        if (toAdd.length > 0) {
          await apiClient.post(`/api/roles/${role.id}/permissions`, { permissionIds: toAdd });
        }
        // Remove deselected permissions (one per request as per API design)
        for (const permId of toRemove) {
          await apiClient.delete(`/api/roles/${role.id}/permissions/${permId}`);
        }
        // Also update description if it changed
        if (description.trim() !== (role.description ?? '')) {
          // Use a PATCH-style body — send only description without name to avoid name-change error
          await apiClient.put(`/api/roles/${role.id}`, {
            name:        role.name,          // keep original name
            description: description.trim() || undefined,
          }).catch(() => { /* ignore if backend still rejects */ });
        }
        toast.success('Permissions updated successfully');
      } else if (isEdit) {
        // Custom role: full update via PUT
        await apiClient.put(`/api/roles/${role!.id}`, {
          name:          name.trim().toUpperCase().replace(/\s+/g, '_'),
          description:   description.trim() || undefined,
          permissionIds: Array.from(selectedIds),
        });
        toast.success('Role updated successfully');
      } else {
        // Create new role
        await apiClient.post('/api/roles', {
          name:          name.trim().toUpperCase().replace(/\s+/g, '_'),
          description:   description.trim() || undefined,
          permissionIds: Array.from(selectedIds),
        });
        toast.success('Role created successfully');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? (isEdit ? 'Failed to update role' : 'Failed to create role'));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 ' +
    'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors';

  // Indeterminate checkbox ref helper
  const IndeterminateCheckbox: React.FC<{
    checked: boolean;
    indeterminate: boolean;
    onChange: () => void;
    onClick: (e: React.MouseEvent) => void;
  }> = ({ checked, indeterminate, onChange, onClick }) => {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (ref.current) ref.current.indeterminate = indeterminate;
    }, [indeterminate]);
    return (
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
      />
    );
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {isEdit ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isEdit
                  ? role?.isSystem
                    ? 'System role — you can only modify its permissions'
                    : 'Update the role name and its permissions'
                  : 'Give the role a name and choose what it can access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <XIcon className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. LOGISTICS MANAGER"
              className={cn(inputCls, isEdit && role?.isSystem ? 'opacity-60 cursor-not-allowed' : '')}
              disabled={isEdit && !!role?.isSystem}
            />
            <p className="text-xs text-neutral-400 mt-1">
              {isEdit && role?.isSystem
                ? '🔒 System role name is locked — only permissions can be changed'
                : 'Saved as uppercase with underscores — spaces are converted automatically'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe what this role is for"
              className={inputCls}
            />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Permissions
                <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  {selectedIds.size} selected
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedIds(
                    selectedIds.size === allPermissions.length
                      ? new Set()
                      : new Set(allPermissions.map(p => p.id)),
                  )
                }
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selectedIds.size === allPermissions.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            {allPermissions.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-sm border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                No permissions have been configured in the system yet
              </div>
            ) : (
              <div className="space-y-2">
                {grouped.map(([cat, perms]) => {
                  const selectedInCat = perms.filter(p => selectedIds.has(p.id)).length;
                  const allOn = selectedInCat === perms.length;
                  const isExpanded = expandedCats.has(cat);

                  return (
                    <div
                      key={cat}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                    >
                      {/* Category row */}
                      <div
                        className={cn(
                          'flex items-center justify-between px-4 py-3',
                          allOn
                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                            : selectedInCat > 0
                            ? 'bg-blue-50/40 dark:bg-blue-900/10'
                            : 'bg-neutral-50 dark:bg-neutral-800/60',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={allOn}
                            ref={el => { if (el) el.indeterminate = selectedInCat > 0 && !allOn; }}
                            onChange={() => toggleCategory(perms)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => toggleExpand(cat)}
                            className="flex items-center gap-2 text-left"
                          >
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                              {translateCategory(cat, t)}
                            </span>
                            <span
                              className={cn(
                                'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                                allOn
                                  ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500',
                              )}
                            >
                              {selectedInCat}/{perms.length}
                            </span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(cat)}
                          className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Permission rows */}
                      {isExpanded && (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {perms.map(perm => (
                            <label
                              key={perm.id}
                              className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.has(perm.id)}
                                onChange={() => togglePerm(perm.id)}
                                className="w-4 h-4 rounded accent-indigo-600 mt-0.5 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-tight">
                                  {formatPermLabel(perm)}
                                </p>
                                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                  {perm.name}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t('common.saving')}</>
            ) : (
              <><Check className="w-4 h-4" />{isEdit ? t('common.saveChanges') : t('settings.roles.createRole')}</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ─── Main Tab Component ───────────────────────────────────────────────────────

const RolesManagementTab: React.FC = () => {
  const { t } = useTranslation();
  const [roles,          setRoles]          = useState<BackendRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<BackendPermission[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedRole,   setSelectedRole]   = useState<BackendRole | null>(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [editingRole,    setEditingRole]    = useState<BackendRole | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.get('/api/roles',       { params: { page: 0, size: 100 } }),
        apiClient.get('/api/permissions', { params: { page: 0, size: 500 } }),
      ]);
      const rolesData = rolesRes.data?.content ?? rolesRes.data ?? [];
      const permsData = permsRes.data?.content ?? permsRes.data ?? [];
      const r = Array.isArray(rolesData) ? rolesData : [];
      const p = Array.isArray(permsData) ? permsData : [];
      setRoles(r);
      setAllPermissions(p);
      // Keep selection in sync after refresh
      setSelectedRole(prev =>
        prev ? (r.find((x: BackendRole) => x.id === prev.id) ?? r[0] ?? null) : (r[0] ?? null),
      );
    } catch {
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (role: BackendRole) => {
    const ok = await confirmDelete(
      `Delete "${role.name.replace(/_/g, ' ')}"?`,
      'This cannot be undone. Users with only this role may lose access.',
    );
    if (!ok) return;
    try {
      await apiClient.delete(`/api/roles/${role.id}`);
      toast.success('Role deleted');
      if (selectedRole?.id === role.id) setSelectedRole(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete role');
    }
  };

  // Group selected role's permissions by category
  const groupedPerms = useMemo<[string, BackendPermission[]][]>(() => {
    if (!selectedRole) return [];
    const g: Record<string, BackendPermission[]> = {};
    selectedRole.permissions.forEach(p => {
      const cat = p.category || 'Other';
      (g[cat] = g[cat] || []).push(p);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [selectedRole]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading roles…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {t('settings.roles.title')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('settings.roles.description')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            title="Refresh"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-neutral-500" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('settings.roles.createRole')}
          </button>
        </div>
      </div>

      {/* ── Role Pills ── */}
      {roles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl">
          <Users className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-500">No roles found</p>
          <p className="text-xs text-neutral-400 mt-1">Create your first role to get started</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {roles.map(role => {
            const colorCls  = getRoleColor(role.name);
            const isSelected = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all',
                  isSelected
                    ? colorCls + ' shadow-sm ring-2 ring-inset ring-current/20'
                    : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                )}
              >
                {role.isSystem
                  ? <Lock className="w-3 h-3 shrink-0 opacity-60" />
                  : <span className={cn('w-2 h-2 rounded-full shrink-0', isSelected ? 'bg-current' : 'bg-neutral-400')} />
                }
                {role.name.replace(/_/g, ' ')}
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    isSelected
                      ? 'bg-black/10 dark:bg-white/10'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500',
                  )}
                >
                  {role.permissions.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Selected Role Detail ── */}
      {selectedRole && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">

          {/* Role info bar */}
          <div className="flex items-center justify-between px-5 py-4 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  getRoleColor(selectedRole.name)
                    .split(' ')
                    .filter(c => c.startsWith('bg-') || c.startsWith('dark:bg-'))
                    .join(' '),
                )}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {selectedRole.name.replace(/_/g, ' ')}
                  </h4>
                  {selectedRole.isSystem ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-500 uppercase tracking-wide">
                      System
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {selectedRole.description || 'No description'} ·{' '}
                  {selectedRole.permissions.length} permission
                  {selectedRole.permissions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditingRole(selectedRole)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {selectedRole.isSystem ? t('settings.roles.editPermissions') : t('common.edit')}
              </button>
              {!selectedRole.isSystem && (
                <button
                  onClick={() => handleDelete(selectedRole)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Permissions grid */}
          {selectedRole.permissions.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 dark:text-neutral-500 text-sm">
              No permissions assigned to this role
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupedPerms.map(([cat, perms]) => (
                <div
                  key={cat}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                      {translateCategory(cat, t)}
                    </span>
                    <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">
                      {perms.length}
                    </span>
                  </div>
                  {/* Permission list */}
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {perms.map(perm => (
                      <div key={perm.id} className="flex items-center gap-2 px-4 py-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs text-neutral-700 dark:text-neutral-300">
                          {formatPermLabel(perm)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <RoleFormModal
          allPermissions={allPermissions}
          onClose={() => setShowCreate(false)}
          onSaved={load}
        />
      )}
      {editingRole && (
        <RoleFormModal
          role={editingRole}
          allPermissions={allPermissions}
          onClose={() => setEditingRole(null)}
          onSaved={() => { load(); setEditingRole(null); }}
        />
      )}
    </div>
  );
};

export default RolesManagementTab;
