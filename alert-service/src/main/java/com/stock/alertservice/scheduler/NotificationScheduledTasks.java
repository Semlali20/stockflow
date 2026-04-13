package com.stock.alertservice.scheduler;

import com.stock.alertservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * ⏰ Notification Scheduled Tasks
 * Automated tasks for notification management
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduledTasks {

    private final NotificationService notificationService;

    @Value("${app.notification.cleanup.old-notifications-days:60}")
    private int oldNotificationsDays;

    @Value("${app.notification.retry.enabled:true}")
    private boolean retryEnabled;

    /**
     * Retry failed notifications
     * Runs every 5 minutes
     */
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    public void retryFailedNotifications() {
        if (!retryEnabled) {
            log.debug("⏸️ Notification retry is disabled");
            return;
        }

        log.info("⏰ Starting scheduled task: Retry failed notifications");

        try {
            notificationService.retryFailedNotifications();
            log.info("✅ Failed notifications retry completed");

        } catch (Exception e) {
            log.error("❌ Error during failed notifications retry", e);
        }
    }

    /**
     * Cleanup old delivered notifications
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void cleanupOldNotifications() {
        log.info("⏰ Starting scheduled task: Cleanup old notifications");

        try {
            notificationService.cleanupOldNotifications(oldNotificationsDays);
            log.info("✅ Old notifications cleanup completed (older than {} days)", oldNotificationsDays);

        } catch (Exception e) {
            log.error("❌ Error during old notifications cleanup", e);
        }
    }

    /**
     * Generate daily notification statistics report
     * Runs daily at 8:00 AM
     */
    @Scheduled(cron = "0 0 8 * * *") // Daily at 8 AM
    public void generateDailyStatistics() {
        log.info("⏰ Starting scheduled task: Generate daily notification statistics");

        try {
            var statistics = notificationService.getNotificationStatistics();

            log.info("📊 Daily Notification Statistics:");
            log.info("   Total Notifications: {}", statistics.get("totalNotifications"));
            log.info("   Pending: {}", statistics.get("pendingNotifications"));
            log.info("   Sent: {}", statistics.get("sentNotifications"));
            log.info("   Delivered: {}", statistics.get("deliveredNotifications"));
            log.info("   Failed: {}", statistics.get("failedNotifications"));

            // TODO: Send daily report email to administrators

        } catch (Exception e) {
            log.error("❌ Error during daily statistics generation", e);
        }
    }

    /**
     * Monitor notification channel health
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void monitorChannelHealth() {
        log.info("⏰ Starting scheduled task: Monitor notification channel health");

        try {
            var statistics = notificationService.getNotificationStatistics();
            var successRates = (java.util.Map<?, ?>) statistics.get("successRateByChannel");

            if (successRates != null) {
                successRates.forEach((channel, rates) -> {
                    var rateMap = (java.util.Map<?, ?>) rates;
                    String successRate = (String) rateMap.get("successRate");
                    log.info("📡 Channel {} success rate: {}", channel, successRate);

                    // TODO: Alert if success rate drops below threshold (e.g., 90%)
                });
            }

        } catch (Exception e) {
            log.error("❌ Error during channel health monitoring", e);
        }
    }
}
