package com.stock.qualityservice.scheduler;

import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.Quarantine;
import com.stock.qualityservice.entity.QuarantineStatus;
import com.stock.qualityservice.repository.QualityControlRepository;
import com.stock.qualityservice.repository.QuarantineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ⏰ Quality Scheduler
 * Automated scheduled tasks for quality operations
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QualityScheduler {

    private final QualityControlRepository qualityControlRepository;
    private final QuarantineRepository quarantineRepository;

    /**
     * Check for overdue inspections
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void checkOverdueInspections() {
        log.info("⏰ Checking for overdue inspections...");

        LocalDateTime now = LocalDateTime.now();

        // Get PENDING and IN_PROGRESS inspections separately
        List<QualityControl> pendingInspections = qualityControlRepository.findByStatus(QCStatus.PENDING);
        List<QualityControl> inProgressInspections = qualityControlRepository.findByStatus(QCStatus.IN_PROGRESS);

        List<QualityControl> overdueInspections = new java.util.ArrayList<>();
        overdueInspections.addAll(pendingInspections.stream()
                .filter(qc -> qc.getScheduledDate() != null && qc.getScheduledDate().isBefore(now))
                .toList());
        overdueInspections.addAll(inProgressInspections.stream()
                .filter(qc -> qc.getScheduledDate() != null && qc.getScheduledDate().isBefore(now))
                .toList());

        if (!overdueInspections.isEmpty()) {
            log.warn("⚠️ Found {} overdue inspections", overdueInspections.size());

            // TODO: Send notifications or alerts for overdue inspections
            for (QualityControl qc : overdueInspections) {
                log.warn("Overdue inspection: {} (scheduled: {})",
                        qc.getInspectionNumber(), qc.getScheduledDate());
            }
        } else {
            log.info("✅ No overdue inspections found");
        }
    }

    /**
     * Check for expiring quarantines
     * Runs every 6 hours
     */
    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    public void checkExpiringQuarantines() {
        log.info("⏰ Checking for expiring quarantines...");

        LocalDateTime sevenDaysFromNow = LocalDateTime.now().plusDays(7);
        List<Quarantine> expiringQuarantines = quarantineRepository
                .findByStatus(QuarantineStatus.IN_PROCESS)
                .stream()
                .filter(q -> q.getExpectedReleaseDate() != null &&
                           q.getExpectedReleaseDate().isBefore(sevenDaysFromNow))
                .toList();

        if (!expiringQuarantines.isEmpty()) {
            log.warn("⚠️ Found {} quarantines expiring within 7 days", expiringQuarantines.size());

            // TODO: Send notifications for expiring quarantines
            for (Quarantine q : expiringQuarantines) {
                log.warn("Expiring quarantine: {} (expected release: {})",
                        q.getQuarantineNumber(), q.getExpectedReleaseDate());
            }
        } else {
            log.info("✅ No expiring quarantines found");
        }
    }

    /**
     * Auto-close old completed inspections
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void archiveOldInspections() {
        log.info("⏰ Archiving old completed inspections...");

        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);

        // Get PASSED and FAILED inspections separately
        List<QualityControl> passedInspections = qualityControlRepository.findByStatus(QCStatus.PASSED);
        List<QualityControl> failedInspections = qualityControlRepository.findByStatus(QCStatus.FAILED);

        List<QualityControl> oldInspections = new java.util.ArrayList<>();
        oldInspections.addAll(passedInspections.stream()
                .filter(qc -> qc.getEndTime() != null && qc.getEndTime().isBefore(ninetyDaysAgo))
                .toList());
        oldInspections.addAll(failedInspections.stream()
                .filter(qc -> qc.getEndTime() != null && qc.getEndTime().isBefore(ninetyDaysAgo))
                .toList());

        if (!oldInspections.isEmpty()) {
            log.info("📦 Found {} old inspections to archive", oldInspections.size());

            // TODO: Implement archiving logic (move to archive table or mark as archived)
            // For now, just log
            log.info("Archiving {} inspections older than 90 days", oldInspections.size());
        } else {
            log.info("✅ No old inspections to archive");
        }
    }

    /**
     * Generate daily quality metrics report
     * Runs daily at 8 AM
     */
    @Scheduled(cron = "0 0 8 * * *") // Daily at 8 AM
    public void generateDailyMetricsReport() {
        log.info("⏰ Generating daily quality metrics report...");

        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        LocalDateTime startOfYesterday = yesterday.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfYesterday = yesterday.withHour(23).withMinute(59).withSecond(59);

        List<QualityControl> yesterdayInspections = qualityControlRepository
                .findByCreatedAtBetween(startOfYesterday, endOfYesterday);

        List<Quarantine> yesterdayQuarantines = quarantineRepository
                .findByEntryDateBetween(startOfYesterday, endOfYesterday);

        long totalInspections = yesterdayInspections.size();
        long passedInspections = yesterdayInspections.stream()
                .filter(qc -> qc.getStatus() == QCStatus.PASSED)
                .count();
        long failedInspections = yesterdayInspections.stream()
                .filter(qc -> qc.getStatus() == QCStatus.FAILED)
                .count();

        double passRate = totalInspections > 0 ?
                (double) passedInspections / totalInspections * 100 : 0.0;

        log.info("📊 Daily Quality Metrics for {}", yesterday.toLocalDate());
        log.info("   Total Inspections: {}", totalInspections);
        log.info("   Passed: {} ({:.2f}%)", passedInspections, passRate);
        log.info("   Failed: {}", failedInspections);
        log.info("   New Quarantines: {}", yesterdayQuarantines.size());

        // TODO: Send email report or store metrics in database
    }

    /**
     * Check for stale in-progress inspections
     * Runs every 4 hours
     */
    @Scheduled(cron = "0 0 */4 * * *") // Every 4 hours
    public void checkStaleInProgressInspections() {
        log.info("⏰ Checking for stale in-progress inspections...");

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        List<QualityControl> staleInspections = qualityControlRepository
                .findByStatus(QCStatus.IN_PROGRESS)
                .stream()
                .filter(qc -> qc.getStartTime() != null && qc.getStartTime().isBefore(twentyFourHoursAgo))
                .toList();

        if (!staleInspections.isEmpty()) {
            log.warn("⚠️ Found {} stale in-progress inspections (started >24h ago)",
                    staleInspections.size());

            // TODO: Send alerts to inspectors or managers
            for (QualityControl qc : staleInspections) {
                log.warn("Stale inspection: {} (started: {}, inspector: {})",
                        qc.getInspectionNumber(), qc.getStartTime(), qc.getInspectorId());
            }
        } else {
            log.info("✅ No stale in-progress inspections found");
        }
    }

    /**
     * Weekly quality summary
     * Runs every Monday at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * MON") // Every Monday at 9 AM
    public void generateWeeklySummary() {
        log.info("⏰ Generating weekly quality summary...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneWeekAgo = now.minusWeeks(1);

        List<QualityControl> weekInspections = qualityControlRepository
                .findByCreatedAtBetween(oneWeekAgo, now);

        List<Quarantine> weekQuarantines = quarantineRepository
                .findByEntryDateBetween(oneWeekAgo, now);

        long totalInspections = weekInspections.size();
        long passedInspections = weekInspections.stream()
                .filter(qc -> qc.getStatus() == QCStatus.PASSED)
                .count();
        long failedInspections = weekInspections.stream()
                .filter(qc -> qc.getStatus() == QCStatus.FAILED)
                .count();

        double passRate = totalInspections > 0 ?
                (double) passedInspections / totalInspections * 100 : 0.0;

        log.info("📊 Weekly Quality Summary (Last 7 Days)");
        log.info("   Total Inspections: {}", totalInspections);
        log.info("   Passed: {} ({:.2f}%)", passedInspections, passRate);
        log.info("   Failed: {}", failedInspections);
        log.info("   New Quarantines: {}", weekQuarantines.size());
        log.info("   Active Quarantines: {}",
                quarantineRepository.findByStatus(QuarantineStatus.IN_PROCESS).size());

        // TODO: Send weekly summary email to management
    }
}
