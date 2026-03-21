// frontend/src/config/movementTypeConfig.ts
// Movement Type Configuration - Defines specific scenarios for each movement type

import { MovementType, TaskType } from "@/types";

export interface MovementTypeConfig {
  type: MovementType;
  label: string;
  icon: string;
  description: string;

  // Location requirements
  requiresSourceLocation: boolean;
  requiresDestinationLocation: boolean;
  sourceLabel?: string;
  destinationLabel?: string;
  locationHelp?: string;

  // Validation rules
  requiresStockValidation: boolean; // Check available stock before allowing line
  allowsNegativeStock?: boolean;    // For adjustments

  // Suggested/default task types
  suggestedTasks: TaskType[];

  // Help text
  scenario: string; // Explains when to use this type
  workflowSteps: string[]; // Step-by-step guide

  // Field visibility
  requiresReferenceNumber?: boolean;
  referencePlaceholder?: string;
}

export const movementTypeConfigs: Record<MovementType, MovementTypeConfig> = {
  [MovementType.RECEIPT]: {
    type: MovementType.RECEIPT,
    label: "Receipt",
    icon: "📥",
    description: "Receive incoming goods into warehouse",

    requiresSourceLocation: false,
    requiresDestinationLocation: true,
    destinationLabel: "Receiving Location",
    locationHelp: "Select the location where goods will be received (e.g., Receiving Dock, Staging Area)",

    requiresStockValidation: false, // No stock check - we're adding inventory

    suggestedTasks: [TaskType.RECEIVE, TaskType.INSPECT, TaskType.PUTAWAY],

    scenario: "Use RECEIPT when receiving goods from suppliers or production. This increases inventory at the destination location.",

    workflowSteps: [
      "Select receiving/staging location as destination",
      "Add items with expected quantities",
      "Optional: Add RECEIVE task to track unloading",
      "Optional: Add INSPECT task for quality check",
      "Optional: Add PUTAWAY task to move to final storage",
      "Complete movement to update inventory"
    ],

    requiresReferenceNumber: true,
    referencePlaceholder: "PO Number, ASN, Delivery Note"
  },

  [MovementType.ISSUE]: {
    type: MovementType.ISSUE,
    label: "Issue",
    icon: "📤",
    description: "Issue goods out of warehouse",

    requiresSourceLocation: true,
    requiresDestinationLocation: false,
    sourceLabel: "Issue From Location",
    locationHelp: "Select the location to issue goods from",

    requiresStockValidation: true, // Must have stock to issue

    suggestedTasks: [TaskType.PICK, TaskType.PACK, TaskType.SHIP],

    scenario: "Use ISSUE when sending goods out of the warehouse to customers, production, or other facilities. This decreases inventory at the source location.",

    workflowSteps: [
      "Select source location (where to pick from)",
      "Add items - stock will be validated",
      "Optional: Add PICK task for warehouse staff",
      "Optional: Add PACK task for packaging",
      "Optional: Add SHIP task for loading",
      "Complete movement to reduce inventory"
    ],

    requiresReferenceNumber: true,
    referencePlaceholder: "Sales Order, Transfer Order, Work Order"
  },

  [MovementType.TRANSFER]: {
    type: MovementType.TRANSFER,
    label: "Transfer",
    icon: "🔄",
    description: "Move goods between locations",

    requiresSourceLocation: true,
    requiresDestinationLocation: true,
    sourceLabel: "From Location",
    destinationLabel: "To Location",
    locationHelp: "Select both source and destination locations within the same warehouse",

    requiresStockValidation: true, // Must have stock at source

    suggestedTasks: [TaskType.PICK, TaskType.TRANSFER, TaskType.PUTAWAY],

    scenario: "Use TRANSFER to move inventory between locations in the same warehouse. Decreases stock at source and increases at destination.",

    workflowSteps: [
      "Select source location (current location)",
      "Select destination location (target location)",
      "Add items - stock validated at source",
      "Optional: Add PICK task to retrieve items",
      "Optional: Add TRANSFER task for movement",
      "Optional: Add PUTAWAY task to store at destination",
      "Complete movement to update both locations"
    ],

    requiresReferenceNumber: false,
    referencePlaceholder: "Transfer Request Number"
  },

  [MovementType.ADJUSTMENT]: {
    type: MovementType.ADJUSTMENT,
    label: "Adjustment",
    icon: "⚖️",
    description: "Correct inventory discrepancies",

    requiresSourceLocation: false,
    requiresDestinationLocation: true,
    destinationLabel: "Location to Adjust",
    locationHelp: "Select the location where inventory needs correction",

    requiresStockValidation: false,
    allowsNegativeStock: true, // Can adjust to any quantity

    suggestedTasks: [TaskType.COUNT, TaskType.INSPECT],

    scenario: "Use ADJUSTMENT to correct inventory errors, damage, spoilage, or shrinkage. Can increase or decrease stock at a location.",

    workflowSteps: [
      "Select location to adjust",
      "Add items with adjustment quantity (positive to add, negative to reduce)",
      "Add notes explaining reason (damage, found stock, error correction)",
      "Optional: Add COUNT task to verify before adjustment",
      "Complete movement to correct inventory"
    ],

    requiresReferenceNumber: true,
    referencePlaceholder: "Adjustment Reason: Damage/Lost/Found/Correction"
  },

  [MovementType.PICKING]: {
    type: MovementType.PICKING,
    label: "Picking",
    icon: "📦",
    description: "Pick items for orders",

    requiresSourceLocation: true,
    requiresDestinationLocation: true,
    sourceLabel: "Pick From Location",
    destinationLabel: "Staging/Packing Location",
    locationHelp: "Pick from storage and move to packing/staging area",

    requiresStockValidation: true,

    suggestedTasks: [TaskType.PICK, TaskType.PACK],

    scenario: "Use PICKING to retrieve items from storage for customer orders or production kits. Moves inventory from storage to staging/packing area.",

    workflowSteps: [
      "Select pick location (storage location)",
      "Select staging/packing area as destination",
      "Add items from order - stock validated",
      "Add PICK task with priority and instructions",
      "Optional: Add PACK task for next step",
      "Complete movement to allocate inventory to order"
    ],

    requiresReferenceNumber: true,
    referencePlaceholder: "Order Number, Wave ID, Batch ID"
  },

  [MovementType.PUTAWAY]: {
    type: MovementType.PUTAWAY,
    label: "Putaway",
    icon: "🏪",
    description: "Store received goods in locations",

    requiresSourceLocation: true,
    requiresDestinationLocation: true,
    sourceLabel: "From Receiving/Staging",
    destinationLabel: "To Storage Location",
    locationHelp: "Move from receiving area to final storage location",

    requiresStockValidation: true, // Must exist at source (receiving area)

    suggestedTasks: [TaskType.PUTAWAY],

    scenario: "Use PUTAWAY after receiving goods to move them from receiving/staging areas to their final storage locations.",

    workflowSteps: [
      "Select source (receiving dock, staging area)",
      "Select destination (final storage location - aisle/rack/bin)",
      "Add items that were received",
      "Add PUTAWAY task with location instructions",
      "Complete movement to move inventory to storage"
    ],

    requiresReferenceNumber: false,
    referencePlaceholder: "Receipt ID, ASN Number"
  },

  [MovementType.RETURN]: {
    type: MovementType.RETURN,
    label: "Return",
    icon: "↩️",
    description: "Process customer or supplier returns",

    requiresSourceLocation: true,
    requiresDestinationLocation: true,
    sourceLabel: "Return From (Customer/Production)",
    destinationLabel: "Return To Location",
    locationHelp: "Source: where item is coming from, Destination: where to place returned items",

    requiresStockValidation: false, // Returns create new inventory

    suggestedTasks: [TaskType.RECEIVE, TaskType.INSPECT, TaskType.PUTAWAY],

    scenario: "Use RETURN for customer returns or supplier returns. Adds inventory back to the warehouse with inspection workflow.",

    workflowSteps: [
      "Select source (customer, production, supplier)",
      "Select destination (returns area, quarantine, or direct to stock)",
      "Add returned items with quantities",
      "Add RECEIVE task to log return",
      "Add INSPECT task to check condition",
      "Add PUTAWAY task if item is acceptable for stock",
      "Complete movement to add inventory"
    ],

    requiresReferenceNumber: true,
    referencePlaceholder: "RMA Number, Return Order, Credit Note"
  },

  [MovementType.CYCLE_COUNT]: {
    type: MovementType.CYCLE_COUNT,
    label: "Cycle Count",
    icon: "🔢",
    description: "Physical inventory count",

    requiresSourceLocation: false,
    requiresDestinationLocation: true,
    destinationLabel: "Location to Count",
    locationHelp: "Select the location(s) being counted",

    requiresStockValidation: false,
    allowsNegativeStock: true, // Can adjust based on count results

    suggestedTasks: [TaskType.COUNT, TaskType.INSPECT],

    scenario: "Use CYCLE_COUNT for periodic physical counts to verify and correct inventory accuracy. Results in adjustments if discrepancies found.",

    workflowSteps: [
      "Select location to count",
      "Add items expected in location",
      "Add COUNT task for warehouse staff",
      "Staff performs count and records actual quantity",
      "System compares actual vs system quantity",
      "Complete movement to adjust inventory to actual count"
    ],

    requiresReferenceNumber: false,
    referencePlaceholder: "Count Schedule ID, Zone ID"
  },

  [MovementType.QUARANTINE]: {
    type: MovementType.QUARANTINE,
    label: "Quarantine",
    icon: "🚫",
    description: "Isolate items for inspection/hold",

    requiresSourceLocation: true,
    requiresDestinationLocation: true,
    sourceLabel: "From Location",
    destinationLabel: "Quarantine Location",
    locationHelp: "Move items to quarantine area for inspection or hold",

    requiresStockValidation: true,

    suggestedTasks: [TaskType.PICK, TaskType.INSPECT, TaskType.TRANSFER],

    scenario: "Use QUARANTINE to isolate items for quality issues, damage, expiry, or pending inspection. Moves inventory to restricted access area.",

    workflowSteps: [
      "Select source location (current location)",
      "Select quarantine location (isolated area)",
      "Add items requiring quarantine",
      "Add notes for quarantine reason",
      "Add INSPECT task for quality team",
      "Complete movement to restrict inventory access",
      "After inspection: TRANSFER back to stock or ADJUSTMENT to write-off"
    ],

    requiresReferenceNumber: true,
    referencePlaceholder: "QC Hold Number, Inspection ID, NCR Number"
  },

  [MovementType.RELOCATION]: {
    type: MovementType.RELOCATION,
    label: "Relocation",
    icon: "📍",
    description: "Reorganize warehouse layout",

    requiresSourceLocation: true,
    requiresDestinationLocation: true,
    sourceLabel: "Current Location",
    destinationLabel: "New Location",
    locationHelp: "Relocate items for warehouse optimization or reorganization",

    requiresStockValidation: true,

    suggestedTasks: [TaskType.PICK, TaskType.TRANSFER, TaskType.PUTAWAY],

    scenario: "Use RELOCATION for warehouse reorganization, slotting optimization, or seasonal layout changes. Similar to TRANSFER but for optimization purposes.",

    workflowSteps: [
      "Select current location",
      "Select new optimized location",
      "Add items to relocate",
      "Add PICK task to retrieve items",
      "Add TRANSFER task for movement",
      "Add PUTAWAY task to place in new location",
      "Complete movement to update inventory location"
    ],

    requiresReferenceNumber: false,
    referencePlaceholder: "Slotting Project ID, Reorganization Plan"
  }
};

// Helper function to get config for a movement type
export const getMovementTypeConfig = (type: MovementType): MovementTypeConfig => {
  return movementTypeConfigs[type];
};

// Helper to check if type requires source location
export const requiresSource = (type: MovementType): boolean => {
  return movementTypeConfigs[type].requiresSourceLocation;
};

// Helper to check if type requires destination location
export const requiresDestination = (type: MovementType): boolean => {
  return movementTypeConfigs[type].requiresDestinationLocation;
};

// Helper to check if type requires stock validation
export const requiresStockCheck = (type: MovementType): boolean => {
  return movementTypeConfigs[type].requiresStockValidation;
};
