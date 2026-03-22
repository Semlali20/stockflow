package com.stock.alertservice.initializer;

import com.stock.alertservice.entity.NotificationChannel;
import com.stock.alertservice.entity.NotificationTemplate;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.repository.NotificationChannelRepository;
import com.stock.alertservice.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Seeds default notification channels and email templates at application startup.
 * Only inserts records that do not already exist (idempotent).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AlertEmailTemplateSeeder implements ApplicationRunner {

    private final NotificationChannelRepository channelRepository;
    private final NotificationTemplateRepository templateRepository;

    @Value("${app.admin.email:admin@stock-management.com}")
    private String adminEmail;

    @Value("${app.dashboard.url:http://localhost:5173}")
    private String dashboardUrl;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Running AlertEmailTemplateSeeder...");
        seedEmailChannel();
        seedLowStockTemplate();
        seedExpiryTemplate();
        seedMovementTemplate();
        log.info("AlertEmailTemplateSeeder completed.");
    }

    private void seedEmailChannel() {
        String channelName = "Default Email Channel";
        if (channelRepository.existsByName(channelName)) {
            log.debug("Email channel '{}' already exists, skipping.", channelName);
            return;
        }

        Map<String, Object> settings = new HashMap<>();
        settings.put("fromAddress", adminEmail);
        settings.put("fromName", "Stock Management System");
        settings.put("replyTo", adminEmail);

        NotificationChannel channel = NotificationChannel.builder()
                .name(channelName)
                .channelType(NotificationChannelType.EMAIL)
                .isActive(true)
                .priority(1)
                .rateLimitPerHour(100)
                .settings(settings)
                .totalNotificationsSent(0L)
                .successfulNotifications(0L)
                .failedNotifications(0L)
                .build();

        channelRepository.save(channel);
        log.info("Created default email channel: {}", channelName);
    }

    private void seedLowStockTemplate() {
        String templateName = "Low Stock Alert Email";
        if (templateRepository.existsByName(templateName)) {
            log.debug("Template '{}' already exists, skipping.", templateName);
            return;
        }

        String htmlBody = loadTemplateHtml("email-low-stock-alert");

        NotificationTemplate template = NotificationTemplate.builder()
                .name(templateName)
                .subject("Low Stock Alert: {{itemName}} - Immediate Action Required")
                .htmlBody(htmlBody)
                .textBody("Low Stock Alert for {{itemName}}. Current quantity: {{currentQuantity}}, Threshold: {{threshold}}. Location: {{warehouseLocation}}. Alert ID: {{alertId}}.")
                .channel(NotificationChannelType.EMAIL)
                .templateType(AlertType.LOW_STOCK)
                .language("en")
                .isActive(true)
                .requiredVariables("itemName,currentQuantity,threshold,warehouseLocation,alertLevel,alertId,dashboardUrl")
                .totalNotificationsSent(0L)
                .build();

        templateRepository.save(template);
        log.info("Created template: {}", templateName);
    }

    private void seedExpiryTemplate() {
        String templateName = "Expiry Alert Email";
        if (templateRepository.existsByName(templateName)) {
            log.debug("Template '{}' already exists, skipping.", templateName);
            return;
        }

        String htmlBody = loadTemplateHtml("email-expiry-alert");

        NotificationTemplate template = NotificationTemplate.builder()
                .name(templateName)
                .subject("Expiry Alert: {{itemName}} (Lot {{lotNumber}}) expires in {{daysUntilExpiry}} days")
                .htmlBody(htmlBody)
                .textBody("Expiry Alert: Item {{itemName}}, Lot {{lotNumber}} expires on {{expiryDate}} ({{daysUntilExpiry}} days remaining). Location: {{warehouseLocation}}. Alert ID: {{alertId}}.")
                .channel(NotificationChannelType.EMAIL)
                .templateType(AlertType.EXPIRY)
                .language("en")
                .isActive(true)
                .requiredVariables("itemName,lotNumber,expiryDate,daysUntilExpiry,warehouseLocation,alertId,dashboardUrl")
                .totalNotificationsSent(0L)
                .build();

        templateRepository.save(template);
        log.info("Created template: {}", templateName);
    }

    private void seedMovementTemplate() {
        String templateName = "Movement Completed Email";
        if (templateRepository.existsByName(templateName)) {
            log.debug("Template '{}' already exists, skipping.", templateName);
            return;
        }

        String htmlBody = loadTemplateHtml("email-movement-completed");

        NotificationTemplate template = NotificationTemplate.builder()
                .name(templateName)
                .subject("Movement Completed: {{referenceNumber}} - {{movementType}}")
                .htmlBody(htmlBody)
                .textBody("Movement {{referenceNumber}} of type {{movementType}} has been completed by {{completedBy}} at {{completedAt}}. Total lines: {{totalLines}}.")
                .channel(NotificationChannelType.EMAIL)
                .templateType(AlertType.MOVEMENT)
                .language("en")
                .isActive(true)
                .requiredVariables("referenceNumber,movementType,completedBy,completedAt,totalLines,dashboardUrl")
                .totalNotificationsSent(0L)
                .build();

        templateRepository.save(template);
        log.info("Created template: {}", templateName);
    }

    /**
     * Load HTML template content from classpath, or return a placeholder if not found.
     */
    private String loadTemplateHtml(String templateFileName) {
        try {
            org.springframework.core.io.ClassPathResource resource =
                    new org.springframework.core.io.ClassPathResource("templates/" + templateFileName + ".html");
            return org.springframework.util.StreamUtils.copyToString(
                    resource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("Could not load HTML template file: {}.html, using placeholder body", templateFileName);
            return "<html><body><p>Template: " + templateFileName + "</p></body></html>";
        }
    }
}
