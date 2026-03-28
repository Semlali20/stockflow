package com.stock.alertservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration properties for auto-dispatch webhooks.
 * Configure via application.yml under app.webhooks list.
 */
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class WebhookProperties {

    private List<WebhookEndpoint> webhooks = new ArrayList<>();

    @Data
    public static class WebhookEndpoint {
        /** Webhook URL to POST to */
        private String url;

        /** Display name for logging */
        private String name = "webhook";

        /** Optional Bearer token for Authorization header */
        private String authToken;

        /** Set to false to disable this endpoint without removing config */
        private boolean enabled = true;
    }
}
