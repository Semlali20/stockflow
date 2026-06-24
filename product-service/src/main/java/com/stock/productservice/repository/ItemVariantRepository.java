package com.stock.productservice.repository;

import com.stock.productservice.entity.ItemVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemVariantRepository extends JpaRepository<ItemVariant, String> {

    Optional<ItemVariant> findBySku(String sku);

    List<ItemVariant> findByParentItemId(String parentItemId);

    List<ItemVariant> findByIsActive(Boolean isActive);

    Page<ItemVariant> findByIsActive(Boolean isActive, Pageable pageable);

    boolean existsBySku(String sku);

    @Query("SELECT iv FROM ItemVariant iv WHERE iv.isActive = true")
    List<ItemVariant> findActiveItemVariants();

    @Query(value = "SELECT iv FROM ItemVariant iv WHERE iv.isActive = true",
           countQuery = "SELECT COUNT(iv) FROM ItemVariant iv WHERE iv.isActive = true")
    Page<ItemVariant> findActiveItemVariants(Pageable pageable);

    @Query("SELECT iv FROM ItemVariant iv WHERE LOWER(iv.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ItemVariant> searchItemVariants(@Param("keyword") String keyword);

    @Query(value = "SELECT iv FROM ItemVariant iv WHERE LOWER(iv.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))",
           countQuery = "SELECT COUNT(iv) FROM ItemVariant iv WHERE LOWER(iv.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ItemVariant> searchItemVariants(@Param("keyword") String keyword, Pageable pageable);
}