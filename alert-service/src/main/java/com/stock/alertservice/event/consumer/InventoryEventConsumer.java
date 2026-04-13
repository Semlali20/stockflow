package com.stock.alertservice.event.consumer;

import com.stock.alertservice.dto.response.AlertResponse;
import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.event.incoming.InventoryEvent;
import com.stock.alertservice.event.incoming.StockBelowThresholdEvent;
import com.stock.alertservice.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;


@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final AlertService alertService;

    /**
     * Listen to inventory.updated events
     * Check if stock levels violate thresholds and create alerts
     */
    @KafkaListener(
            topics = "inventory.updated",
            groupId = "alert-service-group",
            containerFactory = "inventoryEventListenerFactory"
    )
    public void handleInventoryUpdated(
            @Payload InventoryEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic
    ) {
        log.info("📦 Received inventory.updated event - Item: {}, Location: {}, Quantity: {}",
                event.getItemId(), event.getLocationId(), event.getQuantity());

        try {
            // Check if threshold is violated
            if (Boolean.TRUE.equals(event.getThresholdViolated())) {
                createStockAlert(event);
            }

            // Check for critical stock levels (less than 5 units)
            if (event.getQuantity() != null && event.getQuantity() < 5.0) {
                createCriticalStockAlert(event);
            }

        } catch (Exception e) {
            log.error("❌ Error processing inventory.updated event for item: {}", event.getItemId(), e);
        }
    }

    /**
     * Listen to stock.below.threshold events
     * Specifically for low stock alerts
     */
    @KafkaListener(
            topics = "stock.below.threshold",
            groupId = "alert-service-group",
            containerFactory = "stockBelowThresholdListenerFactory"
    )
    public void handleStockBelowThreshold(
            @Payload StockBelowThresholdEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        log.info("⚠️ Received stock.below.threshold event - Item: {}, Location: {}, Quantity: {}",
                event.getItemId(), event.getLocationId(), event.getCurrentQuantity());

        try {
            createLowStockAlertFromThreshold(event);
        } catch (Exception e) {
            log.error("❌ Error processing stock.below.threshold event for item: {}", event.getItemId(), e);
        }
    }

    /**
     * Listen to inventory.low-stock events (alternative topic)
     */
    @KafkaListener(
            topics = "inventory.low-stock",
            groupId = "alert-service-group",
            containerFactory = "stockBelowThresholdListenerFactory"
    )
    public void handleInventoryLowStock(
            @Payload StockBelowThresholdEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        log.info("⚠️ Received inventory.low-stock event - Item: {}, Location: {}, Quantity: {}",
                event.getItemId(), event.getLocationId(), event.getCurrentQuantity());

        try {
            createLowStockAlertFromThreshold(event);
        } catch (Exception e) {
            log.error("❌ Error processing inventory.low-stock event for item: {}", event.getItemId(), e);
        }
    }

    /**
     * Create a stock alert based on threshold violation
     */
    private void createStockAlert(InventoryEvent event) {
        AlertLevel level = determineAlertLevel(event);
        Double qty = event.getQuantity() != null ? event.getQuantity() : 0.0;
        Double minThreshold = event.getMinThreshold() != null ? event.getMinThreshold() : 0.0;

        String message = String.format(
                "Stock threshold violated for item %s at location %s. Current: %.2f, Min Threshold: %.2f",
                event.getItemId(),
                event.getLocationId(),
                qty,
                minThreshold
        );

        Map<String, Object> data = buildAlertData(event);

        AlertResponse alert = alertService.createAlert(
                AlertType.LOW_STOCK,
                level,
                "ITEM",
                event.getItemId(),
                message,
                data,
                null
        );

        log.info("✅ Created stock alert: {}", alert.getId());
    }

    /**
     * Create a critical stock alert (less than 5 units)
     */
    private void createCriticalStockAlert(InventoryEvent event) {
        Double qty = event.getQuantity() != null ? event.getQuantity() : 0.0;
        String message = String.format(
                "EMERGENCY: Item %s at location %s has only %.2f units remaining!",
                event.getItemId(),
                event.getLocationId(),
                qty
        );

        Map<String, Object> data = buildAlertData(event);
        data.put("alertReason", "CRITICAL_LOW_STOCK");
        data.put("threshold", 5.0);

        AlertResponse alert = alertService.createAlert(
                AlertType.LOW_STOCK,
                AlertLevel.EMERGENCY,
                "ITEM",
                event.getItemId(),
                message,
                data,
                null
        );

        log.info("🚨 Created emergency stock alert: {}", alert.getId());
    }

    /**
     * Create a low stock alert from StockBelowThresholdEvent
     */
    private void createLowStockAlertFromThreshold(StockBelowThresholdEvent event) {
        AlertLevel level = event.getCurrentQuantity() != null && event.getCurrentQuantity() < 5.0
                ? AlertLevel.EMERGENCY
                : AlertLevel.WARNING;

        Double qty = event.getCurrentQuantity() != null ? event.getCurrentQuantity() : 0.0;
        String message = String.format(
                "Low stock detected for item %s at location %s. Current quantity: %.2f",
                event.getItemId(),
                event.getLocationId(),
                qty
        );

        Map<String, Object> data = new HashMap<>();
        data.put("itemId", event.getItemId());
        data.put("locationId", event.getLocationId());
        data.put("currentQuantity", qty);
        data.put("threshold", event.getThreshold());
        data.put("alertReason", "LOW_STOCK");

        AlertResponse alert = alertService.createAlert(
                AlertType.LOW_STOCK,
                level,
                "ITEM",
                event.getItemId(),
                message,
                data,
                null
        );

        log.info("⚠️ Created low stock alert from threshold event: {}", alert.getId());
    }

    /**
     * Create a low stock alert from InventoryEvent
     */
    private void createLowStockAlert(InventoryEvent event) {
        Double qty = event.getQuantity() != null ? event.getQuantity() : 0.0;
        AlertLevel level = qty < 5.0 ? AlertLevel.EMERGENCY : AlertLevel.WARNING;

        String message = String.format(
                "Low stock detected for item %s at location %s. Current quantity: %.2f",
                event.getItemId(),
                event.getLocationId(),
                qty
        );

        Map<String, Object> data = buildAlertData(event);
        data.put("alertReason", "LOW_STOCK");

        AlertResponse alert = alertService.createAlert(
                AlertType.LOW_STOCK,
                level,
                "ITEM",
                event.getItemId(),
                message,
                data,
                null
        );

        log.info("⚠️ Created low stock alert: {}", alert.getId());
    }

    /**
     * Determine alert level based on event data
     */
    private AlertLevel determineAlertLevel(InventoryEvent event) {
        if (event.getQuantity() == null) {
            return AlertLevel.WARNING;
        }

        double quantity = event.getQuantity();

        // EMERGENCY if less than 5 units
        if (quantity < 5.0) {
            return AlertLevel.EMERGENCY;
        }
        // WARNING if less than 10 units
        else if (quantity < 10.0) {
            return AlertLevel.WARNING;
        }
        // INFO for other threshold violations
        else {
            return AlertLevel.INFO;
        }
    }

    /**
     * Build alert data map from inventory event
     */
    private Map<String, Object> buildAlertData(InventoryEvent event) {
        Map<String, Object> data = new HashMap<>();
        
        data.put("itemId", event.getItemId());
        data.put("locationId", event.getLocationId());
        data.put("currentQuantity", event.getQuantity());
        data.put("previousQuantity", event.getPreviousQuantity());
        data.put("status", event.getStatus());
        data.put("minThreshold", event.getMinThreshold());
        data.put("maxThreshold", event.getMaxThreshold());
        data.put("eventType", event.getEventType());
        data.put("thresholdViolated", event.getThresholdViolated());
        data.put("violationType", event.getViolationType());
        data.put("eventTimestamp", event.getTimestamp());

        return data;
    }
}