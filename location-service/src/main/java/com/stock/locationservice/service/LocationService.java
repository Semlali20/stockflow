package com.stock.locationservice.service;

import com.stock.locationservice.dto.LocationCreateRequest;
import com.stock.locationservice.dto.LocationDTO;
import com.stock.locationservice.dto.LocationSearchRequest;
import com.stock.locationservice.entity.LocationType;

import java.util.List;

public interface LocationService {

    LocationDTO createLocation(LocationCreateRequest request);

    LocationDTO getLocationById(String id);

    LocationDTO getLocationByCode(String code);

    List<LocationDTO> getAllLocations();

    List<LocationDTO> getLocationsByWarehouseId(String warehouseId);

    List<LocationDTO> getLocationsByType(LocationType type);

    List<LocationDTO> searchLocations(LocationSearchRequest request);

    LocationDTO updateLocation(String id, LocationCreateRequest request);

    void deleteLocation(String id);

    void activateLocation(String id);

    void deactivateLocation(String id);
}
