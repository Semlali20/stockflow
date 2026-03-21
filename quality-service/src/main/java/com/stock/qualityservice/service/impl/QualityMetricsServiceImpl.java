package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.response.InspectionMetricsResponse;
import com.stock.qualityservice.dto.response.QualityMetricsResponse;
import com.stock.qualityservice.dto.response.QuarantineMetricsResponse;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.Quarantine;
import com.stock.qualityservice.entity.QuarantineStatus;
import com.stock.qualityservice.repository.QualityControlRepository;
import com.stock.qualityservice.repository.QuarantineRepository;
import com.stock.qualityservice.service.QualityMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QualityMetricsServiceImpl implements QualityMetricsService {

    private final QualityControlRepository qualityControlRepository;
    private final QuarantineRepository quarantineRepository;

    @Override
    public QualityMetricsResponse getOverallMetrics() {
        log.info("📊 Calculating overall quality metrics");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        return getMetricsForDateRange(thirtyDaysAgo, now);
    }

    @Override
    public QualityMetricsResponse getMetricsForDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating quality metrics from {} to {}", startDate, endDate);

        List<QualityControl> inspections = qualityControlRepository.findByCreatedAtBetween(startDate, endDate);
        List<Quarantine> quarantines = quarantineRepository.findByEntryDateBetween(startDate, endDate);

        long totalInspections = inspections.size();
        long passedInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.PASSED).count();
        long failedInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.FAILED).count();
        long pendingInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.PENDING).count();

        long totalQuarantines = quarantines.size();
        long activeQuarantines = quarantines.stream().filter(q -> q.getStatus() == QuarantineStatus.IN_PROCESS).count();
        long releasedQuarantines = quarantines.stream().filter(q -> q.getStatus() == QuarantineStatus.RELEASED).count();
        long rejectedQuarantines = quarantines.stream().filter(q -> q.getStatus() == QuarantineStatus.REJECTED).count();

        double passRate = totalInspections > 0 ? (double) passedInspections / totalInspections * 100 : 0.0;
        double failRate = totalInspections > 0 ? (double) failedInspections / totalInspections * 100 : 0.0;
        double quarantineRate = totalInspections > 0 ? (double) totalQuarantines / totalInspections * 100 : 0.0;

        double avgDuration = calculateAverageInspectionDuration(inspections);
        double avgDefectRate = calculateAverageDefectRate(inspections);

        return QualityMetricsResponse.builder()
                .totalInspections(totalInspections)
                .passedInspections(passedInspections)
                .failedInspections(failedInspections)
                .pendingInspections(pendingInspections)
                .passRate(passRate)
                .failRate(failRate)
                .totalQuarantines(totalQuarantines)
                .activeQuarantines(activeQuarantines)
                .releasedQuarantines(releasedQuarantines)
                .rejectedQuarantines(rejectedQuarantines)
                .averageInspectionDuration(avgDuration)
                .averageDefectRate(avgDefectRate)
                .quarantineRate(quarantineRate)
                .totalDefects(0L) // TODO: Calculate from inspection results
                .criticalDefects(0L)
                .majorDefects(0L)
                .minorDefects(0L)
                .build();
    }

    @Override
    public InspectionMetricsResponse getInspectionMetrics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating inspection metrics from {} to {}", startDate, endDate);

        List<QualityControl> inspections = qualityControlRepository.findByCreatedAtBetween(startDate, endDate);

        long totalInspections = inspections.size();
        long passedInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.PASSED).count();
        long failedInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.FAILED).count();
        long pendingInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.PENDING).count();
        long inProgressInspections = inspections.stream().filter(i -> i.getStatus() == QCStatus.IN_PROGRESS).count();

        double passRate = totalInspections > 0 ? (double) passedInspections / totalInspections * 100 : 0.0;
        double failRate = totalInspections > 0 ? (double) failedInspections / totalInspections * 100 : 0.0;
        double avgDuration = calculateAverageInspectionDuration(inspections);

        // Group by inspection type
        Map<String, Long> byType = inspections.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getInspectionType() != null ? i.getInspectionType().toString() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Group by status
        Map<String, Long> byStatus = inspections.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getStatus().toString(),
                        Collectors.counting()
                ));

        // Top defect types (placeholder)
        Map<String, Long> topDefects = new HashMap<>();

        // Inspections per inspector
        Map<String, Long> perInspector = inspections.stream()
                .filter(i -> i.getInspectorId() != null)
                .collect(Collectors.groupingBy(
                        QualityControl::getInspectorId,
                        Collectors.counting()
                ));

        // Pass rate per inspector
        Map<String, Double> passRatePerInspector = new HashMap<>();
        for (String inspectorId : perInspector.keySet()) {
            long inspectorTotal = perInspector.get(inspectorId);
            long inspectorPassed = inspections.stream()
                    .filter(i -> inspectorId.equals(i.getInspectorId()) && i.getStatus() == QCStatus.PASSED)
                    .count();
            passRatePerInspector.put(inspectorId, inspectorTotal > 0 ? (double) inspectorPassed / inspectorTotal * 100 : 0.0);
        }

        return InspectionMetricsResponse.builder()
                .totalInspections(totalInspections)
                .passedInspections(passedInspections)
                .failedInspections(failedInspections)
                .pendingInspections(pendingInspections)
                .inProgressInspections(inProgressInspections)
                .passRate(passRate)
                .failRate(failRate)
                .averageDuration(avgDuration)
                .inspectionsByType(byType)
                .inspectionsByStatus(byStatus)
                .topDefectTypes(topDefects)
                .inspectionsPerInspector(perInspector)
                .passRatePerInspector(passRatePerInspector)
                .build();
    }

    @Override
    public QuarantineMetricsResponse getQuarantineMetrics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating quarantine metrics from {} to {}", startDate, endDate);

        List<Quarantine> quarantines = quarantineRepository.findByEntryDateBetween(startDate, endDate);

        long totalQuarantines = quarantines.size();
        long activeQuarantines = quarantines.stream().filter(q -> q.getStatus() == QuarantineStatus.IN_PROCESS).count();
        long releasedQuarantines = quarantines.stream().filter(q -> q.getStatus() == QuarantineStatus.RELEASED).count();
        long rejectedQuarantines = quarantines.stream().filter(q -> q.getStatus() == QuarantineStatus.REJECTED).count();
        long expiringSoon = quarantineRepository.findByStatus(QuarantineStatus.IN_PROCESS).stream()
                .filter(q -> q.getExpectedReleaseDate() != null &&
                            q.getExpectedReleaseDate().isBefore(LocalDateTime.now().plusDays(7)))
                .count();

        double releaseRate = totalQuarantines > 0 ? (double) releasedQuarantines / totalQuarantines * 100 : 0.0;
        double rejectionRate = totalQuarantines > 0 ? (double) rejectedQuarantines / totalQuarantines * 100 : 0.0;
        double avgDuration = calculateAverageQuarantineDuration(quarantines);

        // Group by severity
        Map<String, Long> bySeverity = quarantines.stream()
                .collect(Collectors.groupingBy(
                        q -> q.getSeverity() != null ? q.getSeverity() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Group by reason (first 50 chars of reason)
        Map<String, Long> byReason = quarantines.stream()
                .collect(Collectors.groupingBy(
                        q -> q.getReason() != null ?
                            (q.getReason().length() > 50 ? q.getReason().substring(0, 50) : q.getReason()) :
                            "UNKNOWN",
                        Collectors.counting()
                ));

        // Group by location
        Map<String, Long> byLocation = quarantines.stream()
                .filter(q -> q.getLocationId() != null)
                .collect(Collectors.groupingBy(
                        Quarantine::getLocationId,
                        Collectors.counting()
                ));

        // Top quarantined items
        Map<String, Long> topItems = quarantines.stream()
                .filter(q -> q.getItemId() != null)
                .collect(Collectors.groupingBy(
                        Quarantine::getItemId,
                        Collectors.counting()
                ));

        return QuarantineMetricsResponse.builder()
                .totalQuarantines(totalQuarantines)
                .activeQuarantines(activeQuarantines)
                .releasedQuarantines(releasedQuarantines)
                .rejectedQuarantines(rejectedQuarantines)
                .expiringSoonQuarantines(expiringSoon)
                .releaseRate(releaseRate)
                .rejectionRate(rejectionRate)
                .averageDuration(avgDuration)
                .quarantinesBySeverity(bySeverity)
                .quarantinesByReason(byReason)
                .quarantinesByLocation(byLocation)
                .topQuarantinedItems(topItems)
                .build();
    }

    @Override
    public Double getDefectRateByItem(String itemId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating defect rate for item: {}", itemId);

        List<QualityControl> inspections = qualityControlRepository.findByCreatedAtBetween(startDate, endDate)
                .stream()
                .filter(i -> itemId.equals(i.getItemId()))
                .collect(Collectors.toList());

        if (inspections.isEmpty()) {
            return 0.0;
        }

        double totalDefectRate = inspections.stream()
                .mapToDouble(i -> i.getDefectRate() != null ? i.getDefectRate() : 0.0)
                .sum();

        return totalDefectRate / inspections.size();
    }

    @Override
    public Double getPassRateByInspector(String inspectorId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating pass rate for inspector: {}", inspectorId);

        List<QualityControl> inspections = qualityControlRepository.findByCreatedAtBetween(startDate, endDate)
                .stream()
                .filter(i -> inspectorId.equals(i.getInspectorId()))
                .collect(Collectors.toList());

        if (inspections.isEmpty()) {
            return 0.0;
        }

        long passed = inspections.stream().filter(i -> i.getStatus() == QCStatus.PASSED).count();
        return (double) passed / inspections.size() * 100;
    }

    @Override
    public Double getAverageInspectionDuration(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating average inspection duration");

        List<QualityControl> inspections = qualityControlRepository.findByCreatedAtBetween(startDate, endDate);
        return calculateAverageInspectionDuration(inspections);
    }

    @Override
    public Double getQuarantineRate(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📊 Calculating quarantine rate");

        long totalInspections = qualityControlRepository.findByCreatedAtBetween(startDate, endDate).size();
        long totalQuarantines = quarantineRepository.findByEntryDateBetween(startDate, endDate).size();

        return totalInspections > 0 ? (double) totalQuarantines / totalInspections * 100 : 0.0;
    }

    // Helper methods
    private double calculateAverageInspectionDuration(List<QualityControl> inspections) {
        List<QualityControl> completedInspections = inspections.stream()
                .filter(i -> i.getStartTime() != null && i.getEndTime() != null)
                .collect(Collectors.toList());

        if (completedInspections.isEmpty()) {
            return 0.0;
        }

        double totalHours = completedInspections.stream()
                .mapToDouble(i -> Duration.between(i.getStartTime(), i.getEndTime()).toHours())
                .sum();

        return totalHours / completedInspections.size();
    }

    private double calculateAverageDefectRate(List<QualityControl> inspections) {
        List<QualityControl> withDefectRate = inspections.stream()
                .filter(i -> i.getDefectRate() != null)
                .collect(Collectors.toList());

        if (withDefectRate.isEmpty()) {
            return 0.0;
        }

        double totalDefectRate = withDefectRate.stream()
                .mapToDouble(QualityControl::getDefectRate)
                .sum();

        return totalDefectRate / withDefectRate.size();
    }

    private double calculateAverageQuarantineDuration(List<Quarantine> quarantines) {
        List<Quarantine> releasedQuarantines = quarantines.stream()
                .filter(q -> q.getActualReleaseDate() != null)
                .collect(Collectors.toList());

        if (releasedQuarantines.isEmpty()) {
            return 0.0;
        }

        double totalDays = releasedQuarantines.stream()
                .mapToDouble(q -> Duration.between(q.getCreatedAt(), q.getActualReleaseDate()).toDays())
                .sum();

        return totalDays / releasedQuarantines.size();
    }
}
