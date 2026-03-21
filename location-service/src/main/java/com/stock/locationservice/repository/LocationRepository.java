package com.stock.locationservice.repository;


import com.stock.locationservice.entity.Location;
import com.stock.locationservice.entity.LocationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {

    Optional<Location> findByCode(String code);

    Optional<Location> findByWarehouseIdAndCode(String warehouseId, String code);

    List<Location> findByWarehouseId(String warehouseId);

    List<Location> findByType(LocationType type);

    List<Location> findByIsActive(Boolean isActive);

    List<Location> findByWarehouseIdAndIsActive(String warehouseId, Boolean isActive);

    List<Location> findByWarehouseIdAndType(String warehouseId, LocationType type);

    List<Location> findByWarehouseIdAndZone(String warehouseId, String zone);

    List<Location> findByWarehouseIdAndZoneAndAisle(String warehouseId, String zone, String aisle);

    boolean existsByWarehouseIdAndCode(String warehouseId, String code);

    @Query("SELECT l FROM Location l WHERE l.warehouseId = :warehouseId " +
            "AND (:zone IS NULL OR l.zone = :zone) " +
            "AND (:aisle IS NULL OR l.aisle = :aisle) " +
            "AND (:type IS NULL OR l.type = :type) " +
            "AND l.isActive = true")
    List<Location> searchLocations(
            @Param("warehouseId") String warehouseId,
            @Param("zone") String zone,
            @Param("aisle") String aisle,
            @Param("type") LocationType type
    );

    @Query("SELECT COUNT(l) FROM Location l WHERE l.warehouseId = :warehouseId AND l.isActive = true")
    Long countActiveLocationsByWarehouse(@Param("warehouseId") String warehouseId);

    @Query("SELECT l FROM Location l WHERE l.warehouseId = :warehouseId AND l.type = :type AND l.isActive = true")
    List<Location> findAvailableLocationsByType(
            @Param("warehouseId") String warehouseId,
            @Param("type") LocationType type
    );
}
