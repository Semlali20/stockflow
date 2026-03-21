package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.QuarantineRequest;
import com.stock.qualityservice.dto.request.QuarantineUpdateRequest;
import com.stock.qualityservice.dto.response.QuarantineResponse;
import com.stock.qualityservice.dto.response.QuarantineSummaryResponse;
import com.stock.qualityservice.entity.Quarantine;
import com.stock.qualityservice.entity.QuarantineStatus;
import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.exception.QuarantineNotFoundException;
import com.stock.qualityservice.exception.InvalidQuarantineStateException;
import com.stock.qualityservice.exception.DuplicateQuarantineException;
import com.stock.qualityservice.repository.QuarantineRepository;
import com.stock.qualityservice.service.QuarantineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuarantineServiceImpl implements QuarantineService {

    private final QuarantineRepository quarantineRepository;
    private final com.stock.qualityservice.event.QualityEventPublisher qualityEventPublisher;

    @Override
    public QuarantineResponse createQuarantine(QuarantineRequest request) {
        log.info("🚫 Creating quarantine for item ID: {}", request.getItemId());

        // Check for duplicate active quarantine
        List<QuarantineStatus> activeStatuses = Arrays.asList(QuarantineStatus.IN_PROCESS, QuarantineStatus.QUARANTINED);
        if (quarantineRepository.existsByItemIdAndLotIdAndStatusIn(
                request.getItemId(), request.getLotId(), activeStatuses)) {
            throw new DuplicateQuarantineException(request.getItemId(), request.getLotId());
        }

        Quarantine quarantine = mapToEntity(request);
        Quarantine savedQuarantine = quarantineRepository.save(quarantine);

        log.info("✅ Quarantine created successfully with ID: {}", savedQuarantine.getId());

        // Publish quarantine created event
        qualityEventPublisher.publishQuarantineCreated(savedQuarantine);

        return mapToResponse(savedQuarantine);
    }

    @Override
    public QuarantineResponse updateQuarantine(String id, QuarantineUpdateRequest request) {
        log.info("Updating quarantine ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        if (quarantine.getStatus() == QuarantineStatus.RELEASED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "update");
        }

        if (request.getQuantity() != null) quarantine.setQuantity(request.getQuantity());
        if (request.getLocationId() != null) quarantine.setLocationId(request.getLocationId());
        if (request.getReason() != null) quarantine.setReason(request.getReason());
        if (request.getInspectorId() != null) quarantine.setInspectorId(request.getInspectorId());
        if (request.getQualityProfileId() != null) quarantine.setQualityProfileId(request.getQualityProfileId());
        if (request.getExpectedReleaseDate() != null) quarantine.setExpectedReleaseDate(request.getExpectedReleaseDate());
        if (request.getSeverity() != null) quarantine.setSeverity(request.getSeverity());
        if (request.getNotes() != null) quarantine.setNotes(request.getNotes());

        Quarantine updatedQuarantine = quarantineRepository.save(quarantine);
        log.info("Quarantine updated successfully: {}", id);

        return mapToResponse(updatedQuarantine);
    }

    @Override
    @Transactional(readOnly = true)
    public QuarantineResponse getQuarantineById(String id) {
        log.info("Fetching quarantine by ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        return mapToResponse(quarantine);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuarantineResponse> getAllQuarantines(Pageable pageable) {
        log.info("Fetching all quarantines with pagination");
        return quarantineRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByItemId(String itemId) {
        log.info("Fetching quarantines for item ID: {}", itemId);

        return quarantineRepository.findByItemId(itemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByQualityControlId(String qualityControlId) {
        log.info("Fetching quarantines for quality control ID: {}", qualityControlId);

        return quarantineRepository.findAll().stream()
                .filter(q -> qualityControlId.equals(q.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuarantineResponse> getQuarantinesByStatus(String status, Pageable pageable) {
        log.info("Fetching quarantines by status: {}", status);
        QuarantineStatus quarantineStatus = QuarantineStatus.valueOf(status.toUpperCase());
        return quarantineRepository.findByStatus(quarantineStatus, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getActiveQuarantines() {
        log.info("Fetching active quarantines");
        List<QuarantineStatus> activeStatuses = Arrays.asList(QuarantineStatus.IN_PROCESS, QuarantineStatus.QUARANTINED);
        return quarantineRepository.findByStatusIn(activeStatuses).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByLocation(String locationId) {
        log.info("Fetching quarantines for location: {}", locationId);
        return quarantineRepository.findByLocationId(locationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesExpiringSoon(int days) {
        log.info("Fetching quarantines expiring within {} days", days);
        LocalDateTime endDate = LocalDateTime.now().plusDays(days);
        return quarantineRepository.findByExpectedReleaseDateBeforeAndStatus(endDate, QuarantineStatus.IN_PROCESS).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuarantineResponse updateQuarantineStatus(String id, String status) {
        log.info("Updating status for quarantine ID {} to {}", id, status);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        QuarantineStatus newStatus = QuarantineStatus.valueOf(status.toUpperCase());
        quarantine.setStatus(newStatus);

        Quarantine updatedQuarantine = quarantineRepository.save(quarantine);
        log.info("Quarantine status updated successfully: {}", id);

        return mapToResponse(updatedQuarantine);
    }

    @Override
    public QuarantineResponse releaseQuarantine(String id, String releaseNotes) {
        log.info("↩️ Releasing quarantine ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        if (quarantine.getStatus() == QuarantineStatus.RELEASED) {
            log.warn("⚠️ Quarantine already released: {}", id);
            return mapToResponse(quarantine);
        }

        if (quarantine.getStatus() != QuarantineStatus.IN_PROCESS &&
            quarantine.getStatus() != QuarantineStatus.QUARANTINED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "release");
        }

        quarantine.setStatus(QuarantineStatus.RELEASED);
        quarantine.setDisposition(Disposition.ACCEPT);
        quarantine.setReleaseNotes(releaseNotes);
        quarantine.setActualReleaseDate(LocalDateTime.now());

        Quarantine releasedQuarantine = quarantineRepository.save(quarantine);
        log.info("✅ Quarantine released successfully: {}", id);

        // Publish quarantine released event
        qualityEventPublisher.publishQuarantineReleased(releasedQuarantine);

        return mapToResponse(releasedQuarantine);
    }

    @Override
    public QuarantineResponse rejectQuarantine(String id, String reason) {
        log.info("🗑️ Rejecting quarantine ID: {} (Scrap/Dispose)", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        if (quarantine.getStatus() == QuarantineStatus.REJECTED) {
            log.warn("⚠️ Quarantine already rejected: {}", id);
            return mapToResponse(quarantine);
        }

        if (quarantine.getStatus() != QuarantineStatus.IN_PROCESS &&
            quarantine.getStatus() != QuarantineStatus.QUARANTINED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "reject");
        }

        quarantine.setStatus(QuarantineStatus.REJECTED);
        quarantine.setDisposition(Disposition.REJECT);
        quarantine.setReleaseNotes(reason);
        quarantine.setActualReleaseDate(LocalDateTime.now());

        Quarantine rejectedQuarantine = quarantineRepository.save(quarantine);
        log.info("✅ Quarantine rejected successfully (marked for scrap/disposal): {}", id);

        // Publish quarantine rejected event
        qualityEventPublisher.publishQuarantineRejected(rejectedQuarantine);

        return mapToResponse(rejectedQuarantine);
    }

    @Override
    public QuarantineResponse extendQuarantine(String id, LocalDateTime newEndDate, String reason) {
        log.info("Extending quarantine ID {} to {}", id, newEndDate);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        if (quarantine.getStatus() == QuarantineStatus.RELEASED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "extend");
        }

        quarantine.setExpectedReleaseDate(newEndDate);
        quarantine.setNotes((quarantine.getNotes() != null ? quarantine.getNotes() + "\n" : "")
                + "Extended: " + reason);

        Quarantine updatedQuarantine = quarantineRepository.save(quarantine);
        log.info("Quarantine extended successfully: {}", id);

        return mapToResponse(updatedQuarantine);
    }

    @Override
    public void deleteQuarantine(String id) {
        log.info("Deleting quarantine ID: {}", id);

        if (!quarantineRepository.existsById(id)) {
            throw new QuarantineNotFoundException(id);
        }

        quarantineRepository.deleteById(id);
        log.info("Quarantine deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public QuarantineSummaryResponse getQuarantineSummary() {
        log.info("Generating quarantine summary");

        QuarantineSummaryResponse summary = new QuarantineSummaryResponse();

        summary.setTotalQuarantined(quarantineRepository.count());
        summary.setInProcess(quarantineRepository.countByStatus(QuarantineStatus.IN_PROCESS));
        summary.setReleased(quarantineRepository.countByStatus(QuarantineStatus.RELEASED));
        summary.setRejected(quarantineRepository.countByStatus(QuarantineStatus.REJECTED));
        summary.setTotalQuantityQuarantined(quarantineRepository.getTotalQuarantinedQuantity());
        summary.setOverdueQuarantines((long) quarantineRepository.findOverdueQuarantines(LocalDateTime.now()).size());

        return summary;
    }

    // Helper methods
    private Quarantine mapToEntity(QuarantineRequest request) {
        Quarantine quarantine = new Quarantine();
        quarantine.setQuarantineNumber(generateQuarantineNumber());
        quarantine.setItemId(request.getItemId());
        quarantine.setLotId(request.getLotId());
        quarantine.setSerialNumber(request.getSerialNumber());
        quarantine.setQuantity(request.getQuantity());
        quarantine.setLocationId(request.getLocationId());
        quarantine.setStatus(QuarantineStatus.IN_PROCESS);
        quarantine.setReason(request.getReason());
        quarantine.setInspectorId(request.getInspectorId());
        quarantine.setQualityProfileId(request.getQualityProfileId());
        quarantine.setExpectedReleaseDate(request.getExpectedReleaseDate());
        quarantine.setSeverity(request.getSeverity());
        quarantine.setQuarantineType(request.getQuarantineType());
        quarantine.setNotes(request.getNotes());
        quarantine.setRelatedInspectionId(request.getRelatedInspectionId());
        return quarantine;
    }

    private String generateQuarantineNumber() {
        return "QTN-" + System.currentTimeMillis();
    }

    private QuarantineResponse mapToResponse(Quarantine quarantine) {
        QuarantineResponse response = new QuarantineResponse();
        response.setId(quarantine.getId());
        response.setQuarantineNumber(quarantine.getQuarantineNumber());
        response.setItemId(quarantine.getItemId());
        response.setLotId(quarantine.getLotId());
        response.setSerialNumber(quarantine.getSerialNumber());
        response.setQuantity(quarantine.getQuantity());
        response.setLocationId(quarantine.getLocationId());
        response.setStatus(quarantine.getStatus());
        response.setReason(quarantine.getReason());
        response.setInspectorId(quarantine.getInspectorId());
        response.setQualityProfileId(quarantine.getQualityProfileId());
        response.setEntryDate(quarantine.getEntryDate());
        response.setExpectedReleaseDate(quarantine.getExpectedReleaseDate());
        response.setActualReleaseDate(quarantine.getActualReleaseDate());
        response.setReleaseNotes(quarantine.getReleaseNotes());
        response.setDisposition(quarantine.getDisposition());
        response.setSeverity(quarantine.getSeverity());
        response.setQuarantineType(quarantine.getQuarantineType());
        response.setNotes(quarantine.getNotes());
        response.setRelatedInspectionId(quarantine.getRelatedInspectionId());
        response.setCreatedAt(quarantine.getCreatedAt());
        response.setUpdatedAt(quarantine.getUpdatedAt());
        response.setCreatedBy(quarantine.getCreatedBy());
        response.setUpdatedBy(quarantine.getUpdatedBy());
        return response;
    }
}