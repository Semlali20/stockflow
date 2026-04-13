package com.stock.alertservice.service;

import com.stock.alertservice.config.WebhookProperties;
import com.stock.alertservice.entity.Alert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Automatically dispatches webhook notifications whenever an alert is created.
 * No API call or DB channel configuration needed — just configure app.webhooks in yml.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AlertWebhookDispatcher {

    private final WebhookProperties webhookProperties;
    private final WebhookSenderService webhookSenderService;

    /**
     * Fires webhooks asynchronously for all configured endpoints.
     * Called automatically by AlertServiceImpl right after alert creation.
     */
    @Async
    public void dispatch(Alert alert) {
        List<WebhookProperties.WebhookEndpoint> endpoints = webhookProperties.getWebhooks();

        if (endpoints == null || endpoints.isEmpty()) {
            log.debug("No webhook endpoints configured — skipping dispatch for alert {}", alert.getId());
            return;
        }

        Map<String, Object> payload = buildPayload(alert);

        for (WebhookProperties.WebhookEndpoint endpoint : endpoints) {
            if (!endpoint.isEnabled()) continue;
            if (endpoint.getUrl() == null || endpoint.getUrl().isBlank()) continue;

            try {
                if (endpoint.getAuthToken() != null && !endpoint.getAuthToken().isBlank()) {
                    webhookSenderService.sendAuthenticatedWebhook(endpoint.getUrl(), payload, endpoint.getAuthToken());
                } else {
                    webhookSenderService.sendWebhook(endpoint.getUrl(), payload);
                }
                log.info("✅ Alert webhook dispatched to [{}] {}", endpoint.getName(), endpoint.getUrl());
            } catch (Exception e) {
                log.error("❌ Failed to dispatch alert webhook to [{}] {}: {}",
                        endpoint.getName(), endpoint.getUrl(), e.getMessage());
            }
        }
    }

    private Map<String, Object> buildPayload(Alert alert) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", "alert.created");
        payload.put("alertId", alert.getId());
        payload.put("type", alert.getType() != null ? alert.getType().name() : null);
        payload.put("level", alert.getLevel() != null ? alert.getLevel().name() : null);
        payload.put("status", alert.getStatus() != null ? alert.getStatus().name() : null);
        payload.put("message", alert.getMessage());
        payload.put("entityType", alert.getEntityType());
        payload.put("entityId", alert.getEntityId());
        payload.put("timestamp", LocalDateTime.now().toString());
        if (alert.getData() != null && !alert.getData().isEmpty()) {
            payload.put("data", alert.getData());
        }
        return payload;
    }
}
