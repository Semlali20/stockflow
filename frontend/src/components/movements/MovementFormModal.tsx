// frontend/src/components/movements/MovementFormModal.tsx
// ✅ COMPLETE VERSION WITH 100% BACKEND INTEGRATION

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, ArrowRight, Info } from "lucide-react";
import { movementService } from "@/services/movement.service";
import { productService } from "@/services/product.service";
import { locationService } from "@/services/location.service";
import { inventoryService } from "@/services/inventory.service";
import {
  MovementType,
  MovementStatus,
  MovementPriority,
  LineStatus,
  TaskType,
  TaskStatus,
} from "@/types";
import type { Item, Location, Warehouse } from "@/types";
import { toast } from "react-hot-toast";
import {
  movementTypeConfigs,
  getMovementTypeConfig,
  requiresSource,
  requiresDestination,
  requiresStockCheck
} from "@/config/movementTypeConfig";

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

const MovementFormModal = ({
  isOpen,
  onClose,
  onSuccess,
}: MovementFormModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Reference data from backend
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventoryInfo, setInventoryInfo] = useState<{
    itemId: string;
    locationId: string;
    available: number;
    onHand: number;
    reserved: number;
  } | null>(null);
  const [checkingInventory, setCheckingInventory] = useState(false);
  // Form data
  const [formData, setFormData] = useState<MovementFormData>({
    type: MovementType.RECEIPT,
    warehouseId: "",
    sourceLocationId: "",
    destinationLocationId: "",
    priority: MovementPriority.NORMAL,
    expectedDate: "",
    referenceNumber: "",
    notes: "",
  });

  const [lines, setLines] = useState<LineFormData[]>([]);
  const [newLine, setNewLine] = useState<LineFormData>({
    itemId: "",
    requestedQuantity: 0,
    actualQuantity: 0,
    uom: "UNIT",
    fromLocationId: "",
    toLocationId: "",
    notes: "",
  });
  const fetchInventoryInfo = async (itemId: string, locationId: string) => {
    if (!itemId || !locationId) {
      setInventoryInfo(null);
      return;
    }

    try {
      setCheckingInventory(true);
      
      // ✅ Use getInventoriesByLocation and filter by itemId
      const inventories = await inventoryService.getInventoriesByLocation(locationId);
      const inventory = inventories.find((inv: any) => inv.itemId === itemId);

      if (inventory) {
        setInventoryInfo({
          itemId,
          locationId,
          available: inventory.availableQuantity || 0,
          onHand: inventory.quantityOnHand || 0,
          reserved: inventory.quantityReserved || 0,
        });
        console.log("📊 Inventory fetched:", inventory);
      } else {
        // No inventory found
        setInventoryInfo({
          itemId,
          locationId,
          available: 0,
          onHand: 0,
          reserved: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventoryInfo({
        itemId,
        locationId,
        available: 0,
        onHand: 0,
        reserved: 0,
      });
    } finally {
      setCheckingInventory(false);
    }
  };

  // ✅ NEW: Handle item change with inventory fetch
  const handleItemChange = (itemId: string) => {
    setNewLine({ ...newLine, itemId });

    // Auto-fetch inventory if we have source location
    if (itemId && formData.sourceLocationId) {
      fetchInventoryInfo(itemId, formData.sourceLocationId);
    }
  };

  const [tasks, setTasks] = useState<TaskFormData[]>([]);

  // Get current movement type config
  const currentConfig = getMovementTypeConfig(formData.type);

  // Convert configs to array for selection
  const movementTypes = Object.values(movementTypeConfigs).map(config => ({
    value: config.type,
    label: config.label,
    icon: config.icon,
    desc: config.description
  }));

  // ✅ Load reference data from backend
  // ✅ FIXED: Load reference data from backend
  useEffect(() => {
    const loadReferenceData = async () => {
      if (!isOpen) return;

      setDataLoading(true);
      try {
        console.log("🔄 Loading reference data from backend...");

        // Load all data in parallel
        const [itemsRes, warehousesRes, locationsRes] = await Promise.all([
          productService.getItems({ size: 1000 }),
          locationService.getWarehouses({ size: 1000 }),
          locationService.getLocations({ size: 1000 }),
        ]);

        console.log("📦 Raw API Responses:", {
          itemsRes,
          warehousesRes,
          locationsRes,
        });

        // ✅ FIXED: Handle different response formats
        const extractedItems =
          itemsRes?.content || itemsRes?.data || itemsRes || [];
        const extractedWarehouses =
          warehousesRes?.content || warehousesRes?.data || warehousesRes || [];
        const extractedLocations =
          locationsRes?.content || locationsRes?.data || locationsRes || [];

        setItems(Array.isArray(extractedItems) ? extractedItems : []);
        setWarehouses(
          Array.isArray(extractedWarehouses) ? extractedWarehouses : []
        );
        setLocations(
          Array.isArray(extractedLocations) ? extractedLocations : []
        );

        console.log("✅ Reference data loaded:", {
          items: Array.isArray(extractedItems) ? extractedItems.length : 0,
          warehouses: Array.isArray(extractedWarehouses)
            ? extractedWarehouses.length
            : 0,
          locations: Array.isArray(extractedLocations)
            ? extractedLocations.length
            : 0,
        });

        // ✅ Log first item of each to check structure
        if (extractedItems.length > 0)
          console.log("Sample item:", extractedItems[0]);
        if (extractedWarehouses.length > 0)
          console.log("Sample warehouse:", extractedWarehouses[0]);
        if (extractedLocations.length > 0)
          console.log("Sample location:", extractedLocations[0]);
      } catch (error) {
        console.error("❌ Failed to load reference data:", error);
        toast.error("Failed to load form data. Check console for details.");
      } finally {
        setDataLoading(false);
      }
    };

    loadReferenceData();
  }, [isOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFormData({
        type: MovementType.RECEIPT,
        warehouseId: "",
        sourceLocationId: "",
        destinationLocationId: "",
        priority: MovementPriority.NORMAL,
        expectedDate: "",
        referenceNumber: "",
        notes: "",
      });
      setLines([]);
      setTasks([]);
      setInventoryInfo(null);
    }
  }, [isOpen]);

  // ✅ Validate stock availability
  const validateStockAvailability = async (
    itemId: string,
    locationId: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      console.log("🔍 Checking stock availability...", {
        itemId,
        locationId,
        quantity,
      });

      const available = await inventoryService.checkStockAvailability(
        itemId,
        locationId,
        quantity
      );

      if (!available) {
        const availableQty = await inventoryService.getAvailableQuantity(
          itemId,
          locationId
        );
        toast.error(
          `❌ Insufficient stock! Only ${availableQty} units available`
        );
        return false;
      }

      console.log("✅ Stock is available");
      return true;
    } catch (error) {
      console.error("Stock validation error:", error);
      toast.error("Failed to validate stock availability");
      return false;
    }
  };

  // ✅ Add line with validation

  // ✅ UPDATED: Use type config for stock validation
  const addLine = async () => {
    // Validate required fields
    if (!newLine.itemId || !newLine.requestedQuantity) {
      toast.error("Please fill in Item and Quantity");
      return;
    }

    // ✅ Auto-fill locations from Step 1
    const sourceLocation = formData.sourceLocationId;
    const destinationLocation = formData.destinationLocationId;

    // ✅ UPDATED: Use config to determine if stock validation is needed
    if (requiresStockCheck(formData.type)) {
      if (!sourceLocation) {
        toast.error(`Please select ${currentConfig.sourceLabel || 'source location'} in Step 1 first`);
        return;
      }

      const isAvailable = await validateStockAvailability(
        newLine.itemId,
        sourceLocation,
        newLine.requestedQuantity
      );

      if (!isAvailable) {
        return;
      }
    }

    // ✅ Create line with auto-filled locations
    const lineToAdd = {
      ...newLine,
      actualQuantity: newLine.requestedQuantity,
      fromLocationId: sourceLocation,
      toLocationId: destinationLocation,
    };

    setLines([...lines, lineToAdd]);

    setNewLine({
      itemId: "",
      requestedQuantity: 0,
      actualQuantity: 0,
      uom: "UNIT",
      fromLocationId: "",
      toLocationId: "",
      notes: "",
    });

    console.log("✅ Line added with auto-filled locations:", {
      from: sourceLocation,
      to: destinationLocation,
    });

    toast.success("✅ Line added successfully");
  };
  const updateLine = (index: number, field: string, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };

    if (field === "requestedQuantity") {
      updatedLines[index].actualQuantity = value;
    }

    setLines(updatedLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  // ✅ UPDATED: Add task with auto-filled destination location
  const addTask = () => {
    const newTask = {
      taskType: TaskType.PICK,
      priority: 5,
      locationId: formData.destinationLocationId || "", // ✅ Auto-fill with destination
      instructions: "",
      scheduledStartTime: "",
    };
    setTasks([...tasks, newTask]);

    console.log(
      "✅ Task added with auto-filled location:",
      formData.destinationLocationId
    );
    toast.success("Task added with destination location");
  };

  const updateTask = (index: number, field: string, value: any) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate Step 1
      if (!formData.type || !formData.warehouseId) {
        toast.error("Please fill in Movement Type and Warehouse");
        return;
      }

      // ✅ UPDATED: Validate required locations based on type config
      if (requiresSource(formData.type) && !formData.sourceLocationId) {
        toast.error(`${currentConfig.sourceLabel || 'Source location'} is required for ${currentConfig.label}`);
        return;
      }

      if (requiresDestination(formData.type) && !formData.destinationLocationId) {
        toast.error(`${currentConfig.destinationLabel || 'Destination location'} is required for ${currentConfig.label}`);
        return;
      }

      // ✅ Log what we have
      console.log("📋 Step 1 Complete - Form Data:", {
        type: formData.type,
        warehouseId: formData.warehouseId,
        sourceLocationId: formData.sourceLocationId,
        destinationLocationId: formData.destinationLocationId,
      });
    }

    if (currentStep === 2) {
      if (lines.length === 0) {
        toast.error("Please add at least one line");
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (lines.length === 0) {
      toast.error("Please add at least one line");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        type: formData.type,
        warehouseId: formData.warehouseId,
        priority: formData.priority,
        status: MovementStatus.DRAFT,
        movementDate: new Date().toISOString(),
        sourceLocationId: formData.sourceLocationId || undefined, // ✅ Convert empty string to undefined
        destinationLocationId: formData.destinationLocationId || undefined, // ✅ Convert empty string to undefined
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
        expectedDate: formData.expectedDate
          ? new Date(formData.expectedDate).toISOString()
          : undefined,
        lines: lines.map((line, index) => ({
          itemId: line.itemId,
          requestedQuantity: line.requestedQuantity,
          actualQuantity: line.actualQuantity,
          uom: line.uom,
          fromLocationId: line.fromLocationId || undefined, // ✅ Convert empty string to undefined
          toLocationId: line.toLocationId || undefined, // ✅ Convert empty string to undefined
          status: LineStatus.PENDING,
          lineNumber: index + 1,
          notes: line.notes || undefined,
        })),
        tasks: tasks.map((task) => ({
          taskType: task.taskType,
          priority: task.priority,
          locationId: task.locationId || undefined, // ✅ Convert empty string to undefined
          instructions: task.instructions || undefined,
          scheduledStartTime: task.scheduledStartTime
            ? new Date(task.scheduledStartTime).toISOString()
            : undefined,
        })),
      };

      console.log(
        "📤 Submitting movement:",
        JSON.stringify(submitData, null, 2)
      );

      const response = await movementService.createMovement(submitData);
      console.log("✅ Movement created:", response);

      toast.success("✅ Movement created successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("❌ Failed to create movement:", error);
      console.error("❌ Error response:", error.response?.data);

      // Show detailed error
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create movement";

      toast.error(`Failed to create movement: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get filtered locations for selected warehouse
  const filteredLocations = locations.filter(
    (loc) => loc.warehouseId === formData.warehouseId
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Movement
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEPPER */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step
                      ? "bg-white text-blue-600"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <ArrowRight
                    className={`w-6 h-6 mx-2 ${
                      currentStep > step ? "text-white" : "text-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 max-w-2xl mx-auto text-white/80 text-xs">
            <span>Info</span>
            <span>Items</span>
            <span>Tasks</span>
            <span>Review</span>
          </div>
        </div>

        {/* BODY */}
        {dataLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading form data...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      🎯 Step 1: Basic Information
                    </h3>
                  </div>

                  {/* Movement Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Movement Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {movementTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: type.value })
                          }
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.type === type.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                          }`}
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {type.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scenario Help Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {currentConfig.icon} {currentConfig.label} Scenario
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {currentConfig.scenario}
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="font-semibold mb-2">Workflow Steps:</div>
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            {currentConfig.workflowSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse - DROPDOWN */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.warehouseId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warehouseId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} - {wh.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Source Location - DROPDOWN (Conditional) */}
                  {requiresSource(formData.type) && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {currentConfig.sourceLabel || 'Source Location'}
                        {requiresSource(formData.type) && <span className="text-red-500"> *</span>}
                      </label>
                      <select
                        value={formData.sourceLocationId}
                        onChange={(e) => {
                          console.log(
                            "🔵 Source location changed:",
                            e.target.value
                          );
                          setFormData({
                            ...formData,
                            sourceLocationId: e.target.value,
                          });
                          // ✅ Re-fetch inventory if item is already selected
                          if (newLine.itemId && e.target.value) {
                            fetchInventoryInfo(newLine.itemId, e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.warehouseId}
                        required={requiresSource(formData.type)}
                      >
                        <option value="">Select {currentConfig.sourceLabel || 'Source Location'}</option>
                        {filteredLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} - {loc.code}
                          </option>
                        ))}
                      </select>
                      {!formData.warehouseId ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Select a warehouse first
                        </p>
                      ) : currentConfig.locationHelp && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          💡 {currentConfig.locationHelp}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Destination Location - DROPDOWN (Conditional) */}
                  {requiresDestination(formData.type) && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {currentConfig.destinationLabel || 'Destination Location'}
                        {requiresDestination(formData.type) && <span className="text-red-500"> *</span>}
                      </label>
                      <select
                        value={formData.destinationLocationId}
                        onChange={(e) => {
                          console.log(
                            "🟢 Destination location changed:",
                            e.target.value
                          );
                          setFormData({
                            ...formData,
                            destinationLocationId: e.target.value,
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.warehouseId}
                        required={requiresDestination(formData.type)}
                      >
                        <option value="">Select {currentConfig.destinationLabel || 'Destination Location'}</option>
                        {filteredLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} - {loc.code}
                          </option>
                        ))}
                      </select>
                      {!formData.warehouseId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Select a warehouse first
                        </p>
                      )}
                    </div>
                  )}

                  {/* Priority & Expected Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as MovementPriority,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={MovementPriority.LOW}>Low</option>
                        <option value={MovementPriority.NORMAL}>Normal</option>
                        <option value={MovementPriority.HIGH}>High</option>
                        <option value={MovementPriority.URGENT}>Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Expected Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expectedDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expectedDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Reference & Notes */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Reference Number
                      {currentConfig.requiresReferenceNumber && <span className="text-red-500"> *</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceNumber: e.target.value,
                        })
                      }
                      placeholder={currentConfig.referencePlaceholder || "Optional reference number"}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required={currentConfig.requiresReferenceNumber}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      placeholder="Any additional notes..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Lines */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        📦 Step 2: Movement Lines
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add items to this movement
                        {requiresStockCheck(formData.type) && " (Stock validation enabled)"}
                      </p>

                      {/* ✅ Show selected locations info with DETAILED DEBUG */}
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm space-y-2">
                        {/* Debug Info */}

                        {/* Display with fallback */}
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>From:</strong>{" "}
                            {(() => {
                              if (!formData.sourceLocationId)
                                return "❌ Not set";
                              const loc = locations.find(
                                (l) => l.id === formData.sourceLocationId
                              );
                              console.log(
                                "🔍 Looking for source location:",
                                formData.sourceLocationId
                              );
                              console.log("🔍 Found:", loc);
                              console.log("🔍 All locations:", locations);
                              return (
                                loc?.name ||
                                loc?.code ||
                                `ID: ${formData.sourceLocationId.slice(0, 8)}`
                              );
                            })()}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>To:</strong>{" "}
                            {(() => {
                              if (!formData.destinationLocationId)
                                return "❌ Not set";
                              const loc = locations.find(
                                (l) => l.id === formData.destinationLocationId
                              );
                              console.log(
                                "🔍 Looking for destination location:",
                                formData.destinationLocationId
                              );
                              console.log("🔍 Found:", loc);
                              return (
                                loc?.name ||
                                loc?.code ||
                                `ID: ${formData.destinationLocationId.slice(
                                  0,
                                  8
                                )}`
                              );
                            })()}
                          </span>
                        </div>

                        {/* Full location details */}
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          {formData.sourceLocationId &&
                            (() => {
                              const loc = locations.find(
                                (l) => l.id === formData.sourceLocationId
                              );
                              return loc ? (
                                <div>
                                  Source: {loc.name} ({loc.code}) - Zone:{" "}
                                  {loc.zone}, Aisle: {loc.aisle}
                                </div>
                              ) : (
                                <div className="text-red-600">
                                  ⚠️ Source location not found in loaded data
                                </div>
                              );
                            })()}

                          {formData.destinationLocationId &&
                            (() => {
                              const loc = locations.find(
                                (l) => l.id === formData.destinationLocationId
                              );
                              return loc ? (
                                <div>
                                  Destination: {loc.name} ({loc.code}) - Zone:{" "}
                                  {loc.zone}, Aisle: {loc.aisle}
                                </div>
                              ) : (
                                <div className="text-red-600">
                                  ⚠️ Destination location not found in loaded
                                  data
                                </div>
                              );
                            })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Line Form */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Item - DROPDOWN */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Item <span className="text-red-500">*</span>
                        </label>
                        <select
                        value={newLine.itemId}
                        onChange={(e) => handleItemChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                      >
                          <option value="">Select Item</option>
                          {items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} - {item.sku}
                            </option>
                          ))}
                        </select>
                      </div>
{/* ✅ INVENTORY INFO DISPLAY - Only for types that require stock validation */}
{requiresStockCheck(formData.type) && inventoryInfo && inventoryInfo.itemId === newLine.itemId && (
                        <div className="col-span-2 mt-2">
                          <div
                            className={`rounded-lg p-3 ${
                              inventoryInfo.available >= (newLine.requestedQuantity || 0)
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                📦 Inventory Status at Source Location
                              </span>
                              {checkingInventory && (
                                <span className="text-xs text-gray-500">Loading...</span>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-gray-600 dark:text-gray-400">On Hand</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  {inventoryInfo.onHand}
                                </div>
                              </div>

                              <div>
                                <div className="text-gray-600 dark:text-gray-400">Reserved</div>
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  {inventoryInfo.reserved}
                                </div>
                              </div>

                              <div>
                                <div className="text-gray-600 dark:text-gray-400">Available</div>
                                <div
                                  className={`text-lg font-bold ${
                                    inventoryInfo.available >= (newLine.requestedQuantity || 0)
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {inventoryInfo.available}
                                </div>
                              </div>
                            </div>

                            {/* Warning if insufficient */}
                            {newLine.requestedQuantity > 0 &&
                              inventoryInfo.available < newLine.requestedQuantity && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    Insufficient stock! Only {inventoryInfo.available} units available,
                                    but you requested {newLine.requestedQuantity}
                                  </span>
                                </div>
                              )}

                            {/* Success message */}
                            {newLine.requestedQuantity > 0 &&
                              inventoryInfo.available >= newLine.requestedQuantity && (
                                <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    ✓ Stock available ({inventoryInfo.available - newLine.requestedQuantity} will remain)
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={newLine.requestedQuantity}
                          onChange={(e) =>
                            setNewLine({
                              ...newLine,
                              requestedQuantity: Number(e.target.value),
                            })
                          }
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* UOM */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          UOM
                        </label>
                        <select
                          value={newLine.uom}
                          onChange={(e) =>
                            setNewLine({ ...newLine, uom: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                        >
                          <option value="UNIT">Unit</option>
                          <option value="KG">Kilogram</option>
                          <option value="LITER">Liter</option>
                          <option value="BOX">Box</option>
                          <option value="PALLET">Pallet</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={newLine.notes}
                          onChange={(e) =>
                            setNewLine({ ...newLine, notes: e.target.value })
                          }
                          placeholder="Optional notes"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>

                      {/* ✅ REMOVED: From/To Location dropdowns - auto-filled from formData */}
                    </div>

                    <button
                      type="button"
                      onClick={addLine}
                      className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line {requiresStockCheck(formData.type) && "(Stock Validated)"}
                    </button>
                  </div>

                  {/* Lines List */}
                  {lines.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Added Lines ({lines.length})
                      </h4>
                      {lines.map((line, index) => {
                        const item = items.find((i) => i.id === line.itemId);
                        const fromLoc = locations.find(
                          (l) => l.id === line.fromLocationId
                        );
                        const toLoc = locations.find(
                          (l) => l.id === line.toLocationId
                        );

                        return (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                Line {index + 1}: {item?.name || line.itemId}
                              </div>
                              <button
                                onClick={() => removeLine(index)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <div>
                                Quantity: {line.requestedQuantity} {line.uom}
                              </div>
                              <div>From: {fromLoc?.name || "N/A"}</div>
                              <div>To: {toLoc?.name || "N/A"}</div>
                              {line.notes && <div>Notes: {line.notes}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {lines.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No lines added yet. Add at least one line to continue.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Tasks */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        📋 Step 3: Tasks (Optional)
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add tasks for this movement
                      </p>
                      {/* Suggested Tasks */}
                      {currentConfig.suggestedTasks.length > 0 && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            💡 Suggested tasks for {currentConfig.label}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {currentConfig.suggestedTasks.map((taskType) => (
                              <span
                                key={taskType}
                                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded"
                              >
                                {taskType}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={addTask}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </button>
                  </div>

                  {tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.map((task, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Task {index + 1}
                            </h4>
                            <button
                              onClick={() => removeTask(index)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Task Type
                              </label>
                              <select
                                value={task.taskType}
                                onChange={(e) =>
                                  updateTask(index, "taskType", e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                              >
                                <option value={TaskType.PICK}>Pick</option>
                                <option value={TaskType.PACK}>Pack</option>
                                <option value={TaskType.LOAD}>Load</option>
                                <option value={TaskType.UNLOAD}>Unload</option>
                                <option value={TaskType.COUNT}>Count</option>
                                <option value={TaskType.INSPECT}>
                                  Inspect
                                </option>
                                <option value={TaskType.PUTAWAY}>
                                  Putaway
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Priority
                              </label>
                              <input
                                type="number"
                                value={task.priority}
                                onChange={(e) =>
                                  updateTask(
                                    index,
                                    "priority",
                                    Number(e.target.value)
                                  )
                                }
                                min="1"
                                max="10"
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                              />
                            </div>

                            {/* ✅ UPDATED: Show location as info + allow override */}
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1">
                                Location (Override if needed)
                              </label>
                              <select
                                value={task.locationId}
                                onChange={(e) =>
                                  updateTask(
                                    index,
                                    "locationId",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                                disabled={!formData.warehouseId}
                              >
                                <option value="">Select Location</option>
                                {filteredLocations.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.name} - {loc.code}
                                  </option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                Default:{" "}
                                {locations.find(
                                  (l) => l.id === formData.destinationLocationId
                                )?.name || "Destination location"}
                              </p>
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1">
                                Scheduled Start
                              </label>
                              <input
                                type="datetime-local"
                                value={task.scheduledStartTime}
                                onChange={(e) =>
                                  updateTask(
                                    index,
                                    "scheduledStartTime",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1">
                                Instructions
                              </label>
                              <textarea
                                value={task.instructions}
                                onChange={(e) =>
                                  updateTask(
                                    index,
                                    "instructions",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                                placeholder="Task instructions..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No tasks added. Tasks are optional - you can skip this
                      step.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">
                    ✅ Step 4: Review & Submit
                  </h3>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Movement Type
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formData.type}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Warehouse
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {warehouses.find((w) => w.id === formData.warehouseId)
                          ?.name || "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Lines
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {lines.length}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Tasks
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {tasks.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={currentStep === 1 ? onClose : handlePrevious}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={loading}
                >
                  {currentStep === 1 ? "Cancel" : "Previous"}
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={loading}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Create Movement
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovementFormModal;
