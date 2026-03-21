package com.stock.qualityservice.controller;

import com.stock.qualityservice.dto.response.InspectionMetricsResponse;
import com.stock.qualityservice.dto.response.QualityMetricsResponse;
import com.stock.qualityservice.dto.response.QuarantineMetricsResponse;
import com.stock.qualityservice.service.QualityMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 📊 Quality Metrics Controller
 * Provides analytics and metrics for quality operations
 */
@RestController
@RequestMapping("/api/quality-metrics")
@RequiredArgsConstructor
@Slf4j
public class QualityMetricsController {

    private final QualityMetricsService qualityMetricsService;

    /**
     * Get overall quality metrics (last 30 days)
     */
    @GetMapping("/overall")
    public ResponseEntity<QualityMetricsResponse> getOverallMetrics() {
        log.info("📊 Fetching overall quality metrics");
        QualityMetricsResponse response = qualityMetricsService.getOverallMetrics();
        return ResponseEntity.ok(response);
    }

    /**
     * Get quality metrics for a date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<QualityMetricsResponse> getMetricsForDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching quality metrics from {} to {}", startDate, endDate);
        QualityMetricsResponse response = qualityMetricsService.getMetricsForDateRange(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Get inspection metrics
     */
    @GetMapping("/inspections")
    public ResponseEntity<InspectionMetricsResponse> getInspectionMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching inspection metrics from {} to {}", startDate, endDate);
        InspectionMetricsResponse response = qualityMetricsService.getInspectionMetrics(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Get quarantine metrics
     */
    @GetMapping("/quarantines")
    public ResponseEntity<QuarantineMetricsResponse> getQuarantineMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching quarantine metrics from {} to {}", startDate, endDate);
        QuarantineMetricsResponse response = qualityMetricsService.getQuarantineMetrics(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Get defect rate by item
     */
    @GetMapping("/defect-rate/{itemId}")
    public ResponseEntity<Double> getDefectRateByItem(
            @PathVariable String itemId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching defect rate for item: {}", itemId);
        Double defectRate = qualityMetricsService.getDefectRateByItem(itemId, startDate, endDate);
        return ResponseEntity.ok(defectRate);
    }

    /**
     * Get pass rate by inspector
     */
    @GetMapping("/pass-rate/{inspectorId}")
    public ResponseEntity<Double> getPassRateByInspector(
            @PathVariable String inspectorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching pass rate for inspector: {}", inspectorId);
        Double passRate = qualityMetricsService.getPassRateByInspector(inspectorId, startDate, endDate);
        return ResponseEntity.ok(passRate);
    }

    /**
     * Get average inspection duration
     */
    @GetMapping("/average-duration")
    public ResponseEntity<Double> getAverageInspectionDuration(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching average inspection duration");
        Double avgDuration = qualityMetricsService.getAverageInspectionDuration(startDate, endDate);
        return ResponseEntity.ok(avgDuration);
    }

    /**
     * Get quarantine rate
     */
    @GetMapping("/quarantine-rate")
    public ResponseEntity<Double> getQuarantineRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 Fetching quarantine rate");
        Double quarantineRate = qualityMetricsService.getQuarantineRate(startDate, endDate);
        return ResponseEntity.ok(quarantineRate);
    }
}
