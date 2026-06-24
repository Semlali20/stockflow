package com.stock.locationservice.repository;

import com.stock.locationservice.entity.Site;
import com.stock.locationservice.entity.SiteType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteRepository extends JpaRepository<Site, String> {

    Optional<Site> findByName(String name);

    List<Site> findByType(SiteType type);

    Page<Site> findByType(SiteType type, Pageable pageable);

    List<Site> findByIsActive(Boolean isActive);

    Page<Site> findByIsActive(Boolean isActive, Pageable pageable);

    List<Site> findByTypeAndIsActive(SiteType type, Boolean isActive);

    Page<Site> findByTypeAndIsActive(SiteType type, Boolean isActive, Pageable pageable);

    boolean existsByName(String name);
}
