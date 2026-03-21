package com.stock.alertservice.service;

import java.util.Map;

/**
 * 🔗 Webhook Sender Service
 * Handles HTTP webhook calls to external systems
 */
public interface WebhookSenderService {

    /**
     * Send POST webhook with JSON payload
     */
    void sendWebhook(String url, Map<String, Object> payload);

    /**
     * Send webhook with custom headers
     */
    void sendWebhookWithHeaders(String url, Map<String, Object> payload, Map<String, String> headers);

    /**
     * Send webhook with authentication
     */
    void sendAuthenticatedWebhook(String url, Map<String, Object> payload, String authToken);

    /**
     * Test webhook endpoint availability
     */
    boolean testWebhook(String url);
}
