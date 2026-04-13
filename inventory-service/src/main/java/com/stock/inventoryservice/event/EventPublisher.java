package com.stock.inventoryservice.event;

import com.stock.inventoryservice.event.dto.LotCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishInventoryUpdated(InventoryUpdatedEvent event) {
        log.info("Publishing inventory.updated event for inventory: {}", event.getInventoryId());
        try {
            kafkaTemplate.send("inventory.updated", event.getInventoryId(), event);
            log.info("Successfully published inventory.updated event");
        } catch (Exception e) {
            log.error("Failed to publish inventory.updated event", e);
        }
    }

    public void publishLotCreated(LotCreatedEvent event) {
        log.info("Publishing lot.created event for lot: {}", event.getLotId());
        try {
            kafkaTemplate.send("lot.created", event.getLotId(), event);
            log.info("Successfully published lot.created event");
        } catch (Exception e) {
            log.error("Failed to publish lot.created event", e);
        }
    }

    public void publishStockBelowThreshold(StockBelowThresholdEvent event) {
        log.info("Publishing stock.below.threshold event for item: {} at location: {}",
                event.getItemId(), event.getLocationId());
        try {
            kafkaTemplate.send("stock.below.threshold", event.getItemId(), event);
            log.info("Successfully published stock.below.threshold event");
        } catch (Exception e) {
            log.error("Failed to publish stock.below.threshold event", e);
        }
    }
}
