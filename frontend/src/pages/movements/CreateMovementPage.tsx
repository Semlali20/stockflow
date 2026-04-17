// frontend/src/pages/movements/CreateMovementPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronRight, Info, Plus, Trash2,
  PackagePlus, PackageMinus, ArrowLeftRight, Scale,
  ShoppingCart, Warehouse as WarehouseIcon, Undo2, ClipboardList,
  ShieldAlert, MapPin, AlertTriangle, CheckCircle2,
  Loader2, Package,
} from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { inventoryService } from '@/services/inventory.service';
import { useTranslation } from 'react-i18next';
import {
  MovementType, MovementStatus, MovementPriority, LineStatus, TaskType,
} from '@/types';
import type { Item, Location, Warehouse } from '@/types';
import { toast } from 'react-hot-toast';
import {
  getMovementTypeConfig, requiresSource, requiresDestination, requiresStockCheck,
} from '@/config/movementTypeConfig';
import type { LucideIcon } from 'lucide-react';

// ─── Icon map (no emoji) ──────────────────────────────────────────────────────
const MOVEMENT_TYPE_ICONS: Record<MovementType, LucideIcon> = {
  [MovementType.RECEIPT]: PackagePlus,
  [MovementType.ISSUE]: PackageMinus,
  [MovementType.TRANSFER]: ArrowLeftRight,
  [MovementType.ADJUSTMENT]: Scale,
  [MovementType.PICKING]: ShoppingCart,
  [MovementType.PUTAWAY]: WarehouseIcon,
  [MovementType.RETURN]: Undo2,
  [MovementType.CYCLE_COUNT]: ClipboardList,
  [MovementType.QUARANTINE]: ShieldAlert,
  [MovementType.RELOCATION]: MapPin,
};

// MOVEMENT_TYPES and STEPS are built inside the component using t()
// (see below)

// ─── Form types ───────────────────────────────────────────────────────────────
interface MovementFormData {
  type: MovementType;
  warehouseId: string;
  sourceLocationId: string;
  destinationLocationId: string;
  priority: MovementPriority;
  expectedDate: string;
  referenceNumber: string;
  notes: string;
}

interface LineFormData {
  itemId: string;
  requestedQuantity: number;
  actualQuantity: number;
  uom: string;
  fromLocationId: string;
  toLocationId: string;
  notes: string;
}

interface TaskFormData {
  taskType: TaskType;
  priority: number;
  locationId: string;
  instructions: string;
  scheduledStartTime: string;
}

// ─── Reusable class strings ───────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 ' +
  'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ' +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const labelCls = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5';

// ─── Component ────────────────────────────────────────────────────────────────
const CreateMovementPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const MOVEMENT_TYPES: { value: MovementType; label: string; description: string }[] = [
    { value: MovementType.RECEIPT,     label: t('movements.types.receipt'),     description: t('movements.types.receiptDesc') },
    { value: MovementType.ISSUE,       label: t('movements.types.issue'),       description: t('movements.types.issueDesc') },
    { value: MovementType.TRANSFER,    label: t('movements.types.transfer'),    description: t('movements.types.transferDesc') },
    { value: MovementType.ADJUSTMENT,  label: t('movements.types.adjustment'),  description: t('movements.types.adjustmentDesc') },
    { value: MovementType.PICKING,     label: t('movements.types.picking'),     description: t('movements.types.pickingDesc') },
    { value: MovementType.PUTAWAY,     label: t('movements.types.putaway'),     description: t('movements.types.putawayDesc') },
    { value: MovementType.RETURN,      label: t('movements.types.return'),      description: t('movements.types.returnDesc') },
    { value: MovementType.CYCLE_COUNT, label: t('movements.types.cycleCount'),  description: t('movements.types.cycleCountDesc') },
    { value: MovementType.QUARANTINE,  label: t('movements.types.quarantine'),  description: t('movements.types.quarantineDesc') },
    { value: MovementType.RELOCATION,  label: t('movements.types.relocation'),  description: t('movements.types.relocationDesc') },
  ];

  const STEPS = [
    { id: 1, label: t('movements.steps.movementInfo') },
    { id: 2, label: t('movements.steps.items') },
    { id: 3, label: t('movements.steps.tasks') },
    { id: 4, label: t('movements.steps.review') },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading]         = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [items,      setItems]      = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations,  setLocations]  = useState<Location[]>([]);

  const [inventoryInfo, setInventoryInfo] = useState<{
    itemId: string; locationId: string;
    available: number; onHand: number; reserved: number;
  } | null>(null);
  const [checkingInventory, setCheckingInventory] = useState(false);

  const [formData, setFormData] = useState<MovementFormData>({
    type: MovementType.RECEIPT,
    warehouseId: '',
    sourceLocationId: '',
    destinationLocationId: '',
    priority: MovementPriority.NORMAL,
    expectedDate: '',
    referenceNumber: '',
    notes: '',
  });

  const [lines, setLines] = useState<LineFormData[]>([]);
  const [newLine, setNewLine] = useState<LineFormData>({
    itemId: '', requestedQuantity: 0, actualQuantity: 0,
    uom: 'UNIT', fromLocationId: '', toLocationId: '', notes: '',
  });
  const [tasks, setTasks] = useState<TaskFormData[]>([]);

  const currentConfig    = getMovementTypeConfig(formData.type);
  const filteredLocations = locations.filter(loc => loc.warehouseId === formData.warehouseId);

  // ─── Load reference data ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      try {
        const [itemsRes, warehousesRes, locationsRes] = await Promise.all([
          productService.getItems({ size: 1000 }),
          locationService.getWarehouses({ size: 1000 }),
          locationService.getLocations({ size: 1000 }),
        ]);
        const ext = (r: any) => {
          const arr = r?.content ?? r?.data ?? r;
          return Array.isArray(arr) ? arr : [];
        };
        setItems(ext(itemsRes));
        setWarehouses(ext(warehousesRes));
        setLocations(ext(locationsRes));
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  // ─── Inventory helpers ──────────────────────────────────────────────────────
  const fetchInventoryInfo = async (itemId: string, locationId: string) => {
    if (!itemId || !locationId) { setInventoryInfo(null); return; }
    try {
      setCheckingInventory(true);
      const inventories = await inventoryService.getInventoriesByLocation(locationId);
      const inv = inventories.find((i: any) => i.itemId === itemId);
      setInventoryInfo({
        itemId, locationId,
        available: inv?.availableQuantity ?? 0,
        onHand:    inv?.quantityOnHand    ?? 0,
        reserved:  inv?.quantityReserved  ?? 0,
      });
    } catch {
      setInventoryInfo({ itemId, locationId, available: 0, onHand: 0, reserved: 0 });
    } finally {
      setCheckingInventory(false);
    }
  };

  const validateStockAvailability = async (
    itemId: string, locationId: string, quantity: number,
  ): Promise<boolean> => {
    try {
      const ok = await inventoryService.checkStockAvailability(itemId, locationId, quantity);
      if (!ok) {
        const qty = await inventoryService.getAvailableQuantity(itemId, locationId);
        toast.error(`Insufficient stock. Only ${qty} units available`);
        return false;
      }
      return true;
    } catch {
      toast.error('Failed to validate stock availability');
      return false;
    }
  };

  const handleItemChange = (itemId: string) => {
    setNewLine(prev => ({ ...prev, itemId }));
    if (itemId && formData.sourceLocationId) {
      fetchInventoryInfo(itemId, formData.sourceLocationId);
    }
  };

  // ─── Line handlers ──────────────────────────────────────────────────────────
  const addLine = async () => {
    if (!newLine.itemId || !newLine.requestedQuantity) {
      toast.error('Please fill in Item and Quantity');
      return;
    }
    if (requiresStockCheck(formData.type)) {
      if (!formData.sourceLocationId) {
        toast.error(`Please select ${currentConfig.sourceLabel || 'source location'} first`);
        return;
      }
      const ok = await validateStockAvailability(
        newLine.itemId, formData.sourceLocationId, newLine.requestedQuantity,
      );
      if (!ok) return;
    }
    setLines(prev => [
      ...prev,
      {
        ...newLine,
        actualQuantity: newLine.requestedQuantity,
        fromLocationId: formData.sourceLocationId,
        toLocationId:   formData.destinationLocationId,
      },
    ]);
    setNewLine({ itemId: '', requestedQuantity: 0, actualQuantity: 0, uom: 'UNIT', fromLocationId: '', toLocationId: '', notes: '' });
    toast.success('Line added');
  };

  const removeLine = (index: number) => setLines(prev => prev.filter((_, i) => i !== index));

  // ─── Task handlers ──────────────────────────────────────────────────────────
  const addTask = () =>
    setTasks(prev => [
      ...prev,
      { taskType: TaskType.PICK, priority: 5, locationId: formData.destinationLocationId || '', instructions: '', scheduledStartTime: '' },
    ]);

  const updateTask = (index: number, field: string, value: any) =>
    setTasks(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });

  const removeTask = (index: number) => setTasks(prev => prev.filter((_, i) => i !== index));

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.type || !formData.warehouseId) {
        toast.error('Please select Movement Type and Warehouse');
        return;
      }
      if (requiresSource(formData.type) && !formData.sourceLocationId) {
        toast.error(`${currentConfig.sourceLabel || 'Source location'} is required`);
        return;
      }
      if (requiresDestination(formData.type) && !formData.destinationLocationId) {
        toast.error(`${currentConfig.destinationLabel || 'Destination location'} is required`);
        return;
      }
    }
    if (currentStep === 2 && lines.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (lines.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    setLoading(true);
    try {
      await movementService.createMovement({
        type:        formData.type,
        warehouseId: formData.warehouseId,
        priority:    formData.priority,
        status:      MovementStatus.DRAFT,
        movementDate: new Date().toISOString(),
        sourceLocationId:      formData.sourceLocationId      || undefined,
        destinationLocationId: formData.destinationLocationId || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        notes:           formData.notes           || undefined,
        expectedDate:    formData.expectedDate
          ? new Date(formData.expectedDate).toISOString()
          : undefined,
        lines: lines.map((line, index) => ({
          itemId:            line.itemId,
          requestedQuantity: line.requestedQuantity,
          actualQuantity:    line.actualQuantity,
          uom:               line.uom,
          fromLocationId:    line.fromLocationId || undefined,
          toLocationId:      line.toLocationId   || undefined,
          status:            LineStatus.PENDING,
          lineNumber:        index + 1,
          notes:             line.notes || undefined,
        })),
        tasks: tasks.map(task => ({
          taskType:           task.taskType,
          priority:           task.priority,
          locationId:         task.locationId || undefined,
          instructions:       task.instructions || undefined,
          scheduledStartTime: task.scheduledStartTime
            ? new Date(task.scheduledStartTime).toISOString()
            : undefined,
        })),
      });
      toast.success('Movement created successfully');
      navigate('/movements');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error   ||
        error.message                 ||
        'Failed to create movement';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (dataLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading form data…</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/movements')}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {t('movements.createTitle')}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t('movements.createSubtitle')}
            </p>
          </div>
        </div>

        {/* ── Stepper ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex items-center">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep > step.id
                        ? 'bg-indigo-600 text-white'
                        : currentStep === step.id
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      currentStep >= step.id
                        ? 'text-neutral-800 dark:text-neutral-200'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 rounded-full ${
                      currentStep > step.id
                        ? 'bg-indigo-600'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step Content ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">

          {/* ── STEP 1: Movement Info ─── */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('movements.movementInfo')}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t('movements.movementInfoDesc')}
                </p>
              </div>

              {/* Movement Type Grid */}
              <div>
                <label className={labelCls}>
                  {t('movements.movementType')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {MOVEMENT_TYPES.map(type => {
                    const Icon     = MOVEMENT_TYPE_ICONS[type.value];
                    const selected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            type: type.value,
                            sourceLocationId: '',
                            destinationLocationId: '',
                          }))
                        }
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                            selected
                              ? 'bg-indigo-100 dark:bg-indigo-800/60'
                              : 'bg-neutral-100 dark:bg-neutral-700'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              selected
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          />
                        </div>
                        <p
                          className={`text-xs font-semibold leading-tight ${
                            selected
                              ? 'text-indigo-700 dark:text-indigo-300'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 leading-tight">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scenario info */}
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {currentConfig.label}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {currentConfig.scenario}
                    </p>
                    <div className="space-y-1 pt-1">
                      {currentConfig.workflowSteps.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                        >
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 font-semibold text-[10px]">
                            {i + 1}
                          </span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouse */}
              <div>
                <label className={labelCls}>
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.warehouseId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      warehouseId: e.target.value,
                      sourceLocationId: '',
                      destinationLocationId: '',
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} — {wh.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Location */}
              {requiresSource(formData.type) && (
                <div>
                  <label className={labelCls}>
                    {currentConfig.sourceLabel || 'Source Location'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sourceLocationId}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, sourceLocationId: e.target.value }));
                      if (newLine.itemId && e.target.value)
                        fetchInventoryInfo(newLine.itemId, e.target.value);
                    }}
                    className={inputCls}
                    disabled={!formData.warehouseId}
                  >
                    <option value="">
                      Select {currentConfig.sourceLabel || 'source location'}
                    </option>
                    {filteredLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.code}
                      </option>
                    ))}
                  </select>
                  {!formData.warehouseId && (
                    <p className="text-xs text-neutral-400 mt-1">Select a warehouse first</p>
                  )}
                  {formData.warehouseId && currentConfig.locationHelp && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      {currentConfig.locationHelp}
                    </p>
                  )}
                </div>
              )}

              {/* Destination Location */}
              {requiresDestination(formData.type) && (
                <div>
                  <label className={labelCls}>
                    {currentConfig.destinationLabel || 'Destination Location'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.destinationLocationId}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, destinationLocationId: e.target.value }))
                    }
                    className={inputCls}
                    disabled={!formData.warehouseId}
                  >
                    <option value="">
                      Select {currentConfig.destinationLabel || 'destination location'}
                    </option>
                    {filteredLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.code}
                      </option>
                    ))}
                  </select>
                  {!formData.warehouseId && (
                    <p className="text-xs text-neutral-400 mt-1">Select a warehouse first</p>
                  )}
                </div>
              )}

              {/* Priority & Expected Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, priority: e.target.value as MovementPriority }))
                    }
                    className={inputCls}
                  >
                    <option value={MovementPriority.LOW}>Low</option>
                    <option value={MovementPriority.NORMAL}>Normal</option>
                    <option value={MovementPriority.HIGH}>High</option>
                    <option value={MovementPriority.URGENT}>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Expected Date</label>
                  <input
                    type="datetime-local"
                    value={formData.expectedDate}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, expectedDate: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className={labelCls}>
                  Reference Number
                  {currentConfig.requiresReferenceNumber && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))
                  }
                  placeholder={currentConfig.referencePlaceholder || 'Optional reference number'}
                  className={inputCls}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes…"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Items ─── */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Movement Items
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Add items to this movement
                  {requiresStockCheck(formData.type) ? ' — stock will be validated' : ''}
                </p>
              </div>

              {/* Location summary */}
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 mr-1.5">
                      From
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {formData.sourceLocationId
                        ? locations.find(l => l.id === formData.sourceLocationId)?.name ?? 'Selected'
                        : 'Not required'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 shrink-0" />
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 mr-1.5">
                      To
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {formData.destinationLocationId
                        ? locations.find(l => l.id === formData.destinationLocationId)?.name ?? 'Selected'
                        : 'Not required'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Line form */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Add Item Line
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelCls}>
                      Item <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newLine.itemId}
                      onChange={e => handleItemChange(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select item</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelCls}>
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newLine.requestedQuantity || ''}
                      onChange={e =>
                        setNewLine(prev => ({ ...prev, requestedQuantity: Number(e.target.value) }))
                      }
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <select
                      value={newLine.uom}
                      onChange={e => setNewLine(prev => ({ ...prev, uom: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="UNIT">Unit</option>
                      <option value="KG">Kilogram</option>
                      <option value="LITER">Liter</option>
                      <option value="BOX">Box</option>
                      <option value="PALLET">Pallet</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Notes</label>
                    <input
                      type="text"
                      value={newLine.notes}
                      onChange={e => setNewLine(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Optional"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Inventory status panel */}
                {requiresStockCheck(formData.type) &&
                  inventoryInfo &&
                  inventoryInfo.itemId === newLine.itemId && (
                    <div
                      className={`rounded-lg p-4 ${
                        inventoryInfo.available >= (newLine.requestedQuantity || 0)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                          Inventory at Source Location
                        </span>
                        {checkingInventory && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'On Hand',   value: inventoryInfo.onHand,    cls: 'text-neutral-800 dark:text-neutral-200' },
                          { label: 'Reserved',  value: inventoryInfo.reserved,  cls: 'text-amber-600 dark:text-amber-400' },
                          {
                            label: 'Available',
                            value: inventoryInfo.available,
                            cls:
                              inventoryInfo.available >= (newLine.requestedQuantity || 0)
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400',
                          },
                        ].map(col => (
                          <div key={col.label}>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {col.label}
                            </p>
                            <p className={`text-xl font-bold ${col.cls}`}>{col.value}</p>
                          </div>
                        ))}
                      </div>
                      {newLine.requestedQuantity > 0 &&
                        inventoryInfo.available < newLine.requestedQuantity && (
                          <div className="mt-3 flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Insufficient stock — only {inventoryInfo.available} units available
                          </div>
                        )}
                      {newLine.requestedQuantity > 0 &&
                        inventoryInfo.available >= newLine.requestedQuantity && (
                          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Stock available —{' '}
                            {inventoryInfo.available - newLine.requestedQuantity} units will remain
                          </div>
                        )}
                    </div>
                  )}

                <button
                  type="button"
                  onClick={addLine}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Line{requiresStockCheck(formData.type) ? ' (stock validated)' : ''}
                </button>
              </div>

              {/* Lines list */}
              {lines.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    {lines.length} line{lines.length > 1 ? 's' : ''} added
                  </h3>
                  {lines.map((line, index) => {
                    const item    = items.find(i => i.id === line.itemId);
                    const fromLoc = locations.find(l => l.id === line.fromLocationId);
                    const toLoc   = locations.find(l => l.id === line.toLocationId);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4"
                      >
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            {item?.name || line.itemId}
                          </p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">
                            {line.requestedQuantity} {line.uom}
                            {fromLoc && ` · From: ${fromLoc.name}`}
                            {toLoc   && ` · To: ${toLoc.name}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeLine(index)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-400 dark:text-neutral-500 text-sm border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                  No items added yet. Add at least one line to continue.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Tasks ─── */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Tasks{' '}
                    <span className="text-sm font-normal text-neutral-400">(optional)</span>
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Assign tasks to warehouse staff for this movement
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTask}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {/* Suggested tasks */}
              {currentConfig.suggestedTasks.length > 0 && (
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                    Suggested for {currentConfig.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentConfig.suggestedTasks.map(taskType => (
                      <span
                        key={taskType}
                        className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800"
                      >
                        {taskType}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          Task {index + 1}
                        </h3>
                        <button
                          onClick={() => removeTask(index)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Task Type</label>
                          <select
                            value={task.taskType}
                            onChange={e => updateTask(index, 'taskType', e.target.value)}
                            className={inputCls}
                          >
                            <option value={TaskType.PICK}>Pick</option>
                            <option value={TaskType.PACK}>Pack</option>
                            <option value={TaskType.SHIP}>Ship</option>
                            <option value={TaskType.RECEIVE}>Receive</option>
                            <option value={TaskType.COUNT}>Count</option>
                            <option value={TaskType.INSPECT}>Inspect</option>
                            <option value={TaskType.PUTAWAY}>Putaway</option>
                            <option value={TaskType.TRANSFER}>Transfer</option>
                            <option value={TaskType.LOAD}>Load</option>
                            <option value={TaskType.UNLOAD}>Unload</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Priority (1 – 10)</label>
                          <input
                            type="number"
                            value={task.priority}
                            onChange={e => updateTask(index, 'priority', Number(e.target.value))}
                            min="1"
                            max="10"
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelCls}>Location</label>
                          <select
                            value={task.locationId}
                            onChange={e => updateTask(index, 'locationId', e.target.value)}
                            className={inputCls}
                            disabled={!formData.warehouseId}
                          >
                            <option value="">Select location</option>
                            {filteredLocations.map(loc => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name} — {loc.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className={labelCls}>Scheduled Start</label>
                          <input
                            type="datetime-local"
                            value={task.scheduledStartTime}
                            onChange={e =>
                              updateTask(index, 'scheduledStartTime', e.target.value)
                            }
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelCls}>Instructions</label>
                          <textarea
                            value={task.instructions}
                            onChange={e => updateTask(index, 'instructions', e.target.value)}
                            rows={2}
                            placeholder="Task instructions…"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-sm border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                  No tasks added. Tasks are optional — you can proceed without them.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Review ─── */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Review &amp; Confirm
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Review the details before creating the movement
                </p>
              </div>

              {/* Movement details */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Movement Details
                  </h3>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
                  {(
                    [
                      { label: 'Type',      value: formData.type },
                      { label: 'Warehouse', value: warehouses.find(w => w.id === formData.warehouseId)?.name },
                      { label: 'Priority',  value: formData.priority },
                      requiresSource(formData.type) && {
                        label: currentConfig.sourceLabel || 'Source',
                        value: locations.find(l => l.id === formData.sourceLocationId)?.name,
                      },
                      requiresDestination(formData.type) && {
                        label: currentConfig.destinationLabel || 'Destination',
                        value: locations.find(l => l.id === formData.destinationLocationId)?.name,
                      },
                      formData.referenceNumber && { label: 'Reference', value: formData.referenceNumber },
                      formData.notes         && { label: 'Notes',     value: formData.notes },
                    ] as any[]
                  )
                    .filter(Boolean)
                    .map((row: any) => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {row.label}
                        </span>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {row.value || '—'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Items summary */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {lines.length} Item{lines.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
                  {lines.map((line, i) => {
                    const item = items.find(it => it.id === line.itemId);
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {item?.name || line.itemId}
                        </span>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {line.requestedQuantity} {line.uom}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasks summary */}
              {tasks.length > 0 && (
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {tasks.length} Task{tasks.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
                    {tasks.map((task, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          Task {i + 1}: {task.taskType}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          Priority {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Footer Navigation ─── */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
            <button
              type="button"
              onClick={currentStep === 1 ? () => navigate('/movements') : () => setCurrentStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Movement
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMovementPage;
