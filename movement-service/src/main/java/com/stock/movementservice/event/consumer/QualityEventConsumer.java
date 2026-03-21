package com.stock.movementservice.event.consumer;

import com.stock.movementservice.event.dto.QualityInspectionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Consumes quality inspection events to handle QC results
 * Blocks/allows movements based on quality status
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QualityEventConsumer {

    @KafkaListener(
        topics = "quality.inspection.completed",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleInspectionCompleted(
        @Payload QualityInspectionEvent event,
        @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        log.info("🔬 Received quality.inspection.completed: {} - Result: {}", 
            event.getInspectionId(), event.getResult());
        
        try {
            if ("APPROVED".equals(event.getResult())) {
                log.info("✅ Item {} APPROVED - movements allowed", event.getItemId());
                // TODO: Allow outbound movements for this lot/location
                
            } else if ("REJECTED".equals(event.getResult())) {
                log.warn("❌ Item {} REJECTED - movements blocked", event.getItemId());
                // TODO: Block all movements for this lot/location
                // TODO: Create disposal movement if needed
                
            } else if ("QUARANTINE".equals(event.getResult())) {
                log.warn("⚠️ Item {} QUARANTINED - movements restricted", event.getItemId());
                // TODO: Only allow movements to quarantine location
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing quality.inspection.completed: {}", event.getInspectionId(), e);
        }
    }

    @KafkaListener(
        topics = "quality.quarantine.created",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleQuarantineCreated(
        @Payload QualityInspectionEvent event
    ) {
        log.info("🚫 Received quality.quarantine.created: Item {} at location {}", 
            event.getItemId(), event.getLocationId());
        
        try {
            // Block outbound movements from quarantine location
            log.warn("🚫 Quarantine active - blocking movements for item {} at location {}", 
                event.getItemId(), event.getLocationId());
            // TODO: Update movement validation rules
            
        } catch (Exception e) {
            log.error("❌ Error processing quality.quarantine.created", e);
        }
    }

    @KafkaListener(
        topics = "quality.quarantine.released",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleQuarantineReleased(
        @Payload QualityInspectionEvent event
    ) {
        log.info("✅ Received quality.quarantine.released: Item {}", event.getItemId());
        
        try {
            // Allow movements again
            log.info("✅ Quarantine released - allowing movements for item {}", event.getItemId());
            // TODO: Update movement validation rules
            
        } catch (Exception e) {
            log.error("❌ Error processing quality.quarantine.released", e);
        }
    }

    @KafkaListener(
        topics = "quality.quarantine.rejected",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleQuarantineRejected(
        @Payload QualityInspectionEvent event
    ) {
        log.info("❌ Received quality.quarantine.rejected: Item {} - Defect: {}", 
            event.getItemId(), event.getDefectType());
        
        try {
            // Create disposal movement
            log.warn("❌ Item rejected - disposal movement required for item {}", event.getItemId());
            // TODO: Auto-create disposal/scrap movement
            
        } catch (Exception e) {
            log.error("❌ Error processing quality.quarantine.rejected", e);
        }
    }
}