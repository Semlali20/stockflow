package com.stock.alertservice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.alertservice.service.WebhookSenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * 🔗 Webhook Sender Service Implementation
 * Sends HTTP POST requests to webhook endpoints
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookSenderServiceImpl implements WebhookSenderService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void sendWebhook(String url, Map<String, Object> payload) {
        log.info("🔗 Sending webhook to: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Webhook sent successfully to: {}", url);
            } else {
                log.warn("⚠️ Webhook returned non-success status: {} for URL: {}",
                        response.getStatusCode(), url);
            }

        } catch (RestClientException e) {
            log.error("❌ Failed to send webhook to: {}", url, e);
            throw new RuntimeException("Failed to send webhook: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendWebhookWithHeaders(String url, Map<String, Object> payload, Map<String, String> customHeaders) {
        log.info("🔗 Sending webhook with custom headers to: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Add custom headers
            customHeaders.forEach(headers::set);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Webhook with headers sent successfully to: {}", url);
            } else {
                log.warn("⚠️ Webhook returned non-success status: {} for URL: {}",
                        response.getStatusCode(), url);
            }

        } catch (RestClientException e) {
            log.error("❌ Failed to send webhook with headers to: {}", url, e);
            throw new RuntimeException("Failed to send webhook: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendAuthenticatedWebhook(String url, Map<String, Object> payload, String authToken) {
        log.info("🔗 Sending authenticated webhook to: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Authenticated webhook sent successfully to: {}", url);
            } else {
                log.warn("⚠️ Webhook returned non-success status: {} for URL: {}",
                        response.getStatusCode(), url);
            }

        } catch (RestClientException e) {
            log.error("❌ Failed to send authenticated webhook to: {}", url, e);
            throw new RuntimeException("Failed to send webhook: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean testWebhook(String url) {
        log.info("🔗 Testing webhook endpoint: {}", url);

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            boolean isAvailable = response.getStatusCode().is2xxSuccessful();

            if (isAvailable) {
                log.info("✅ Webhook endpoint is available: {}", url);
            } else {
                log.warn("⚠️ Webhook endpoint returned status: {} for URL: {}",
                        response.getStatusCode(), url);
            }

            return isAvailable;

        } catch (RestClientException e) {
            log.error("❌ Webhook endpoint is not available: {}", url, e);
            return false;
        }
    }
}
