package com.stock.locationservice.service.impl;

import com.stock.locationservice.dto.WarehouseCreateRequest;
import com.stock.locationservice.dto.WarehouseDTO;
import com.stock.locationservice.entity.Site;
import com.stock.locationservice.entity.Warehouse;
import com.stock.locationservice.repository.SiteRepository;
import com.stock.locationservice.repository.WarehouseRepository;
import com.stock.locationservice.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final SiteRepository siteRepository;

    @Override
    public WarehouseDTO createWarehouse(WarehouseCreateRequest request) {
        log.info("Creating warehouse with code: {}", request.getCode());

        // Vérifier si le site existe
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site not found with ID: " + request.getSiteId()));

        // Vérifier si le code existe déjà
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Warehouse with code " + request.getCode() + " already exists");
        }

        Warehouse warehouse = Warehouse.builder()
                .siteId(request.getSiteId())
                .name(request.getName())
                .code(request.getCode())
                .settings(request.getSettings())
                .isActive(true)
                .build();

        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        log.info("Warehouse created successfully with ID: {}", savedWarehouse.getId());

        return mapToDTO(savedWarehouse, site.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseDTO getWarehouseById(String id) {
        log.info("Fetching warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));

        String siteName = getSiteName(warehouse.getSiteId());

        return mapToDTO(warehouse, siteName);
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseDTO getWarehouseByCode(String code) {
        log.info("Fetching warehouse with code: {}", code);

        Warehouse warehouse = warehouseRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with code: " + code));

        String siteName = getSiteName(warehouse.getSiteId());

        return mapToDTO(warehouse, siteName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDTO> getAllWarehouses() {
        log.info("Fetching all warehouses");

        return warehouseRepository.findAll().stream()
                .map(warehouse -> {
                    String siteName = getSiteName(warehouse.getSiteId());
                    return mapToDTO(warehouse, siteName);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDTO> getWarehousesBySiteId(String siteId) {
        log.info("Fetching warehouses for site ID: {}", siteId);

        String siteName = getSiteName(siteId);

        return warehouseRepository.findBySiteId(siteId).stream()
                .map(warehouse -> mapToDTO(warehouse, siteName))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDTO> getActiveWarehouses() {
        log.info("Fetching active warehouses");

        return warehouseRepository.findByIsActive(true).stream()
                .map(warehouse -> {
                    String siteName = getSiteName(warehouse.getSiteId());
                    return mapToDTO(warehouse, siteName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseDTO updateWarehouse(String id, WarehouseCreateRequest request) {
        log.info("Updating warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));

        warehouse.setSiteId(request.getSiteId());
        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode());
        warehouse.setSettings(request.getSettings());

        Warehouse updatedWarehouse = warehouseRepository.save(warehouse);
        log.info("Warehouse updated successfully with ID: {}", updatedWarehouse.getId());

        String siteName = getSiteName(updatedWarehouse.getSiteId());

        return mapToDTO(updatedWarehouse, siteName);
    }

    @Override
    public void deleteWarehouse(String id) {
        log.info("Deleting warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));

        warehouseRepository.delete(warehouse);
        log.info("Warehouse deleted successfully with ID: {}", id);
    }

    @Override
    public void activateWarehouse(String id) {
        log.info("Activating warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));

        warehouse.setIsActive(true);
        warehouseRepository.save(warehouse);
        log.info("Warehouse activated successfully with ID: {}", id);
    }

    @Override
    public void deactivateWarehouse(String id) {
        log.info("Deactivating warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));

        warehouse.setIsActive(false);
        warehouseRepository.save(warehouse);
        log.info("Warehouse deactivated successfully with ID: {}", id);
    }

    // Helper methods
    private String getSiteName(String siteId) {
        return siteRepository.findById(siteId)
                .map(Site::getName)
                .orElse("Unknown");
    }

    // Mapper Entity → DTO
    private WarehouseDTO mapToDTO(Warehouse warehouse, String siteName) {
        return WarehouseDTO.builder()
                .id(warehouse.getId())
                .siteId(warehouse.getSiteId())
                .siteName(siteName)
                .name(warehouse.getName())
                .code(warehouse.getCode())
                .settings(warehouse.getSettings())
                .isActive(warehouse.getIsActive())
                .createdAt(warehouse.getCreatedAt())
                .updatedAt(warehouse.getUpdatedAt())
                .build();
    }
}
