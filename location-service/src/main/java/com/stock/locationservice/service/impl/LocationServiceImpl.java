package com.stock.locationservice.service.impl;


import com.stock.locationservice.dto.LocationCreateRequest;
import com.stock.locationservice.dto.LocationDTO;
import com.stock.locationservice.dto.LocationSearchRequest;
import com.stock.locationservice.entity.Location;
import com.stock.locationservice.entity.LocationType;
import com.stock.locationservice.entity.Warehouse;
import com.stock.locationservice.event.LocationEventPublisher;
import com.stock.locationservice.repository.LocationRepository;
import com.stock.locationservice.repository.WarehouseRepository;
import com.stock.locationservice.service.LocationService;
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
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationEventPublisher eventPublisher;
    @Override
    public LocationDTO createLocation(LocationCreateRequest request) {
        log.info("Creating location with code: {}", request.getCode());

        // Vérifier si le warehouse existe
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));

        // Vérifier si le code existe déjà dans ce warehouse
        if (locationRepository.existsByWarehouseIdAndCode(request.getWarehouseId(), request.getCode())) {
            throw new RuntimeException("Location with code " + request.getCode() +
                    " already exists in warehouse: " + warehouse.getName());
        }

        Location location = Location.builder()
                .warehouseId(request.getWarehouseId())
                .code(request.getCode())
                .zone(request.getZone())
                .aisle(request.getAisle())
                .rack(request.getRack())
                .level(request.getLevel())
                .bin(request.getBin())
                .type(request.getType())
                .capacity(request.getCapacity())
                .restrictions(request.getRestrictions())
                .coordinates(request.getCoordinates())
                .isActive(true)
                .build();

        Location savedLocation = locationRepository.save(location);
        log.info("Location created successfully with ID: {}", savedLocation.getId());
        LocationDTO dto = mapToDTO(savedLocation, warehouse.getName());
        eventPublisher.publishLocationCreated(dto); // ✅ Now publishing events!

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public LocationDTO getLocationById(String id) {
        log.info("Fetching location with ID: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));

        String warehouseName = getWarehouseName(location.getWarehouseId());

        return mapToDTO(location, warehouseName);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationDTO getLocationByCode(String code) {
        log.info("Fetching location with code: {}", code);

        Location location = locationRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Location not found with code: " + code));

        String warehouseName = getWarehouseName(location.getWarehouseId());

        return mapToDTO(location, warehouseName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDTO> getAllLocations() {
        log.info("Fetching all locations");

        return locationRepository.findAll().stream()
                .map(location -> {
                    String warehouseName = getWarehouseName(location.getWarehouseId());
                    return mapToDTO(location, warehouseName);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDTO> getLocationsByWarehouseId(String warehouseId) {
        log.info("Fetching locations for warehouse ID: {}", warehouseId);

        String warehouseName = getWarehouseName(warehouseId);

        return locationRepository.findByWarehouseId(warehouseId).stream()
                .map(location -> mapToDTO(location, warehouseName))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDTO> getLocationsByType(LocationType type) {
        log.info("Fetching locations by type: {}", type);

        return locationRepository.findByType(type).stream()
                .map(location -> {
                    String warehouseName = getWarehouseName(location.getWarehouseId());
                    return mapToDTO(location, warehouseName);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDTO> searchLocations(LocationSearchRequest request) {
        log.info("Searching locations with criteria: {}", request);

        return locationRepository.searchLocations(
                        request.getWarehouseId(),
                        request.getZone(),
                        request.getAisle(),
                        request.getType()
                ).stream()
                .map(location -> {
                    String warehouseName = getWarehouseName(location.getWarehouseId());
                    return mapToDTO(location, warehouseName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public LocationDTO updateLocation(String id, LocationCreateRequest request) {
        log.info("Updating location with ID: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));

        location.setWarehouseId(request.getWarehouseId());
        location.setCode(request.getCode());
        location.setZone(request.getZone());
        location.setAisle(request.getAisle());
        location.setRack(request.getRack());
        location.setLevel(request.getLevel());
        location.setBin(request.getBin());
        location.setType(request.getType());
        location.setCapacity(request.getCapacity());
        location.setRestrictions(request.getRestrictions());
        location.setCoordinates(request.getCoordinates());

        Location updatedLocation = locationRepository.save(location);
        log.info("Location updated successfully with ID: {}", updatedLocation.getId());

        String warehouseName = getWarehouseName(updatedLocation.getWarehouseId());

        return mapToDTO(updatedLocation, warehouseName);
    }

    @Override
    public void deleteLocation(String id) {
        log.info("Deleting location with ID: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));

        locationRepository.delete(location);
        log.info("Location deleted successfully with ID: {}", id);
    }

    @Override
    public void activateLocation(String id) {
        log.info("Activating location with ID: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));

        location.setIsActive(true);
        locationRepository.save(location);
        log.info("Location activated successfully with ID: {}", id);
    }

    @Override
    public void deactivateLocation(String id) {
        log.info("Deactivating location with ID: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));

        location.setIsActive(false);
        locationRepository.save(location);
        log.info("Location deactivated successfully with ID: {}", id);
    }

    // Helper methods
    private String getWarehouseName(String warehouseId) {
        return warehouseRepository.findById(warehouseId)
                .map(Warehouse::getName)
                .orElse("Unknown");
    }

    // Mapper Entity → DTO
    private LocationDTO mapToDTO(Location location, String warehouseName) {
        return LocationDTO.builder()
                .id(location.getId())
                .warehouseId(location.getWarehouseId())
                .warehouseName(warehouseName)
                .code(location.getCode())
                .zone(location.getZone())
                .aisle(location.getAisle())
                .rack(location.getRack())
                .level(location.getLevel())
                .bin(location.getBin())
                .type(location.getType())
                .capacity(location.getCapacity())
                .restrictions(location.getRestrictions())
                .coordinates(location.getCoordinates())
                .isActive(location.getIsActive())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}
