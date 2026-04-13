package com.stock.locationservice.controller;
import com.stock.locationservice.dto.WarehouseCreateRequest;
import com.stock.locationservice.dto.WarehouseDTO;
import com.stock.locationservice.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
@Slf4j
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<WarehouseDTO> createWarehouse(@Valid @RequestBody WarehouseCreateRequest request) {
        log.info("REST request to create warehouse: {}", request.getName());
        WarehouseDTO created = warehouseService.createWarehouse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouseById(@PathVariable String id) {
        log.info("REST request to get warehouse by ID: {}", id);
        WarehouseDTO warehouse = warehouseService.getWarehouseById(id);
        return ResponseEntity.ok(warehouse);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<WarehouseDTO> getWarehouseByCode(@PathVariable String code) {
        log.info("REST request to get warehouse by code: {}", code);
        WarehouseDTO warehouse = warehouseService.getWarehouseByCode(code);
        return ResponseEntity.ok(warehouse);
    }

    @GetMapping
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses(
            @RequestParam(required = false) String siteId,
            @RequestParam(required = false) Boolean active) {
        log.info("REST request to get all warehouses - siteId: {}, active: {}", siteId, active);

        List<WarehouseDTO> warehouses;

        if (siteId != null) {
            warehouses = warehouseService.getWarehousesBySiteId(siteId);
        } else if (active != null && active) {
            warehouses = warehouseService.getActiveWarehouses();
        } else {
            warehouses = warehouseService.getAllWarehouses();
        }

        return ResponseEntity.ok(warehouses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDTO> updateWarehouse(
            @PathVariable String id,
            @Valid @RequestBody WarehouseCreateRequest request) {
        log.info("REST request to update warehouse with ID: {}", id);
        WarehouseDTO updated = warehouseService.updateWarehouse(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable String id) {
        log.info("REST request to delete warehouse with ID: {}", id);
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateWarehouse(@PathVariable String id) {
        log.info("REST request to activate warehouse with ID: {}", id);
        warehouseService.activateWarehouse(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateWarehouse(@PathVariable String id) {
        log.info("REST request to deactivate warehouse with ID: {}", id);
        warehouseService.deactivateWarehouse(id);
        return ResponseEntity.ok().build();
    }
}
