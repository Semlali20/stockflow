package com.stock.qualityservice.event.incoming;

import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.event.QualityEventPublisher;
import com.stock.qualityservice.repository.QualityControlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 📥 Movement Event Consumer
 * Listens to movement.completed events and auto-creates quality inspections
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MovementEventConsumer {

    private final QualityControlRepository qualityControlRepository;
    private final QualityEventPublisher qualityEventPublisher;

    /**
     * 🎧 Consume Movement Completed Events
     * Auto-creates quality inspection for RECEIPT movements
     */
    @KafkaListener(topics = "movement.completed", groupId = "quality-service-group")
    public void consumeMovementCompleted(MovementCompletedEvent event) {
        log.info("📨 Received movement.completed event: {}", event.getMovementId());

        try {
            // Only auto-create inspections for RECEIPT movements
            if ("RECEIPT".equalsIgnoreCase(event.getMovementType())) {
                log.info("📦 RECEIPT movement detected - Auto-creating quality inspection");

                // Process each movement line
                for (MovementCompletedEvent.MovementLineDTO line : event.getMovementLines()) {
                    createAutoInspection(event, line);
                }
            } else {
                log.debug("ℹ️ Movement type {} does not require auto-inspection", event.getMovementType());
            }

        } catch (Exception e) {
            log.error("❌ Error processing movement.completed event: {}", event.getMovementId(), e);
            // Don't throw exception - let movement complete even if inspection creation fails
        }
    }

    /**
     * 🔨 Create Auto Inspection for Receipt Line
     */
    private void createAutoInspection(MovementCompletedEvent event,
                                      MovementCompletedEvent.MovementLineDTO line) {
        try {
            log.info("🔍 Creating auto-inspection for Item: {}, Quantity: {}",
                     line.getItemId(), line.getQuantity());

            // Check if inspection already exists for this movement line
            boolean exists = qualityControlRepository
                    .existsByRelatedMovementIdAndItemId(event.getMovementId().toString(), line.getItemId().toString());

            if (exists) {
                log.warn("⚠️ Inspection already exists for movement {} and item {}",
                         event.getMovementId(), line.getItemId());
                return;
            }

            // Create new QualityControl record
            QualityControl qc = new QualityControl();
            qc.setId(UUID.randomUUID().toString());
            qc.setInspectionNumber(generateInspectionNumber());
            qc.setItemId(line.getItemId().toString());
            qc.setLotId(line.getLotId() != null ? line.getLotId().toString() : null);
            qc.setSerialNumber(line.getSerialNumber());
            qc.setQuantityInspected(line.getQuantity());
            qc.setStatus(QCStatus.PENDING);
            qc.setRelatedMovementId(event.getMovementId().toString());
            qc.setLocationId(event.getDestinationLocationId() != null ? event.getDestinationLocationId().toString() : null);
            qc.setWarehouseId(event.getWarehouseId() != null ? event.getWarehouseId().toString() : null);
            qc.setNotes("Auto-created inspection for RECEIPT movement: " + event.getMovementNumber());
            qc.setCreatedAt(LocalDateTime.now());
            qc.setUpdatedAt(LocalDateTime.now());

            QualityControl saved = qualityControlRepository.save(qc);
            log.info("✅ Auto-inspection created successfully: {}", saved.getInspectionNumber());

            // Publish inspection.created event
            qualityEventPublisher.publishInspectionCreated(saved);

        } catch (Exception e) {
            log.error("❌ Failed to create auto-inspection for item {}: {}",
                      line.getItemId(), e.getMessage());
            // Don't rethrow - let other lines process
        }
    }

    /**
     * 🔢 Generate Inspection Number
     */
    private String generateInspectionNumber() {
        return "INS-" + System.currentTimeMillis();
    }

    /**
     * 📋 Movement Completed Event DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MovementCompletedEvent {
        private UUID movementId;
        private String movementNumber;
        private String movementType; // RECEIPT, ISSUE, TRANSFER, etc.
        private UUID warehouseId;
        private UUID sourceLocationId;
        private UUID destinationLocationId;
        private String status;
        private LocalDateTime completedAt;
        private java.util.List<MovementLineDTO> movementLines;

        @lombok.Data
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class MovementLineDTO {
            private UUID lineId;
            private UUID itemId;
            private UUID lotId;
            private String serialNumber;
            private Double quantity;
        }
    }
}
