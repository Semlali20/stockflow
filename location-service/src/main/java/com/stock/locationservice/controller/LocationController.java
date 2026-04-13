package com.stock.locationservice.controller;

import com.stock.locationservice.dto.LocationCreateRequest;
import com.stock.locationservice.dto.LocationDTO;
import com.stock.locationservice.dto.LocationSearchRequest;
import com.stock.locationservice.entity.LocationType;
import com.stock.locationservice.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Slf4j
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<LocationDTO> createLocation(@Valid @RequestBody LocationCreateRequest request) {
        log.info("REST request to create location: {}", request.getCode());
        LocationDTO created = locationService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationDTO> getLocationById(@PathVariable String id) {
        log.info("REST request to get location by ID: {}", id);
        LocationDTO location = locationService.getLocationById(id);
        return ResponseEntity.ok(location);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<LocationDTO> getLocationByCode(@PathVariable String code) {
        log.info("REST request to get location by code: {}", code);
        LocationDTO location = locationService.getLocationByCode(code);
        return ResponseEntity.ok(location);
    }

    @GetMapping
    public ResponseEntity<List<LocationDTO>> getAllLocations(
            @RequestParam(required = false) String warehouseId,
            @RequestParam(required = false) LocationType type) {
        log.info("REST request to get all locations - warehouseId: {}, type: {}", warehouseId, type);

        List<LocationDTO> locations;

        if (warehouseId != null) {
            locations = locationService.getLocationsByWarehouseId(warehouseId);
        } else if (type != null) {
            locations = locationService.getLocationsByType(type);
        } else {
            locations = locationService.getAllLocations();
        }

        return ResponseEntity.ok(locations);
    }

    @PostMapping("/search")
    public ResponseEntity<List<LocationDTO>> searchLocations(@RequestBody LocationSearchRequest request) {
        log.info("REST request to search locations with criteria: {}", request);
        List<LocationDTO> locations = locationService.searchLocations(request);
        return ResponseEntity.ok(locations);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocationDTO> updateLocation(
            @PathVariable String id,
            @Valid @RequestBody LocationCreateRequest request) {
        log.info("REST request to update location with ID: {}", id);
        LocationDTO updated = locationService.updateLocation(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String id) {
        log.info("REST request to delete location with ID: {}", id);
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateLocation(@PathVariable String id) {
        log.info("REST request to activate location with ID: {}", id);
        locationService.activateLocation(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateLocation(@PathVariable String id) {
        log.info("REST request to deactivate location with ID: {}", id);
        locationService.deactivateLocation(id);
        return ResponseEntity.ok().build();
    }
}
