package com.stock.qualityservice.event.incoming;

import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.repository.QualityControlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 📥 Inventory Event Consumer
 * Listens to inventory events and updates quality control status
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final QualityControlRepository qualityControlRepository;

    /**
     * 🎧 Consume Inventory Status Update Events
     * Updates related quality inspections when inventory status changes
     */
    @KafkaListener(topics = "inventory.status.update", groupId = "quality-service-group")
    public void consumeInventoryStatusUpdate(InventoryStatusUpdateEvent event) {
        log.info("📨 Received inventory.status.update event for Item: {}, Status: {}",
                 event.getItemId(), event.getNewStatus());

        try {
            // Find pending inspections for this item
            List<QualityControl> pendingInspections = qualityControlRepository
                    .findByItemIdAndStatus(event.getItemId().toString(),
                            com.stock.qualityservice.entity.QCStatus.PENDING);

            if (!pendingInspections.isEmpty()) {
                log.info("ℹ️ Found {} pending inspections for item {}",
                         pendingInspections.size(), event.getItemId());

                // Handle different status changes
                handleStatusChange(event, pendingInspections);
            }

        } catch (Exception e) {
            log.error("❌ Error processing inventory.status.update event: {}", event.getItemId(), e);
        }
    }

    /**
     * 🔄 Handle Status Changes
     */
    private void handleStatusChange(InventoryStatusUpdateEvent event,
                                     List<QualityControl> inspections) {
        String newStatus = event.getNewStatus();

        switch (newStatus) {
            case "QUARANTINED":
            case "DAMAGED":
                log.warn("⚠️ Item {} moved to {} - Quality inspection may be required",
                         event.getItemId(), newStatus);
                // Could trigger additional inspection or update inspection priority
                break;

            case "AVAILABLE":
                log.info("✅ Item {} marked as AVAILABLE", event.getItemId());
                // This usually means inspection passed or item was approved
                break;

            case "RESERVED":
                log.info("📌 Item {} reserved - Inspection should be completed before use",
                         event.getItemId());
                break;

            default:
                log.debug("ℹ️ Status change to {} for item {}", newStatus, event.getItemId());
        }
    }

    /**
     * 🎧 Consume Low Stock Alerts
     * Could trigger additional quality checks for low stock items
     */
    @KafkaListener(topics = "inventory.low-stock", groupId = "quality-service-group")
    public void consumeLowStockAlert(LowStockEvent event) {
        log.info("📨 Received low-stock alert for Item: {}, Current: {}, Min: {}",
                 event.getItemId(), event.getCurrentQuantity(), event.getMinimumQuantity());

        try {
            // Find recent inspections for this item
            List<QualityControl> recentInspections = qualityControlRepository
                    .findTop5ByItemIdOrderByCreatedAtDesc(event.getItemId().toString());

            if (!recentInspections.isEmpty()) {
                log.info("ℹ️ Found {} recent inspections for low-stock item {}",
                         recentInspections.size(), event.getItemId());

                // Could calculate quality metrics or trigger additional checks
                long failedCount = recentInspections.stream()
                        .filter(qc -> qc.getStatus() ==
                                com.stock.qualityservice.entity.QCStatus.FAILED)
                        .count();

                if (failedCount > recentInspections.size() / 2) {
                    log.warn("⚠️ High failure rate for item {} - {} of {} recent inspections failed",
                             event.getItemId(), failedCount, recentInspections.size());
                }
            }

        } catch (Exception e) {
            log.error("❌ Error processing low-stock alert: {}", event.getItemId(), e);
        }
    }

    /**
     * 📋 Inventory Status Update Event DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InventoryStatusUpdateEvent {
        private UUID eventId;
        private String eventType;
        private LocalDateTime eventTime;
        private UUID itemId;
        private UUID lotId;
        private UUID serialId;
        private String oldStatus;
        private String newStatus;
        private String reason;
        private String updatedBy;
    }

    /**
     * 📋 Low Stock Event DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class LowStockEvent {
        private UUID eventId;
        private LocalDateTime eventTime;
        private UUID itemId;
        private UUID warehouseId;
        private Double currentQuantity;
        private Double minimumQuantity;
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    }
}
