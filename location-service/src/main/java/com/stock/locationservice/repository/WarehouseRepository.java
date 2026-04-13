package com.stock.locationservice.repository;

import com.stock.locationservice.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, String> {

    Optional<Warehouse> findByCode(String code);

    List<Warehouse> findBySiteId(String siteId);

    List<Warehouse> findByIsActive(Boolean isActive);

    List<Warehouse> findBySiteIdAndIsActive(String siteId, Boolean isActive);

    boolean existsByCode(String code);

    @Query("SELECT w FROM Warehouse w WHERE w.siteId = :siteId AND w.isActive = true")
    List<Warehouse> findActiveWarehousesBySite(@Param("siteId") String siteId);

    @Query("SELECT COUNT(w) FROM Warehouse w WHERE w.siteId = :siteId")
    Long countBySiteId(@Param("siteId") String siteId);
}
