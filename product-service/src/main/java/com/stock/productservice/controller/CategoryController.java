package com.stock.productservice.controller;

import com.stock.productservice.dto.CategoryCreateRequest;
import com.stock.productservice.dto.CategoryDTO;
import com.stock.productservice.dto.CategoryUpdateRequest;
import com.stock.productservice.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Category Management", description = "Category management endpoints")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create category", description = "Create a new category")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        log.info("REST request to create category: {}", request.getName());
        CategoryDTO created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get category details by ID")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable String id) {
        log.info("REST request to get category by ID: {}", id);
        CategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get category by name", description = "Get category details by name")
    public ResponseEntity<CategoryDTO> getCategoryByName(@PathVariable String name) {
        log.info("REST request to get category by name: {}", name);
        CategoryDTO category = categoryService.getCategoryByName(name);
        return ResponseEntity.ok(category);
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Get all categories with optional filters")
    public ResponseEntity<List<CategoryDTO>> getAllCategories(
            @RequestParam(required = false) String parentId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean rootOnly) {
        log.info("REST request to get all categories - parentId: {}, active: {}, rootOnly: {}",
                parentId, active, rootOnly);

        List<CategoryDTO> categories;

        if (rootOnly != null && rootOnly) {
            categories = categoryService.getRootCategories();
        } else if (parentId != null) {
            categories = categoryService.getCategoriesByParentId(parentId);
        } else if (active != null && active) {
            categories = categoryService.getActiveCategories();
        } else {
            categories = categoryService.getAllCategories();
        }

        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update an existing category")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        log.info("REST request to update category with ID: {}", id);
        CategoryDTO updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete a category")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        log.info("REST request to delete category with ID: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate category", description = "Activate a category")
    public ResponseEntity<Void> activateCategory(@PathVariable String id) {
        log.info("REST request to activate category with ID: {}", id);
        categoryService.activateCategory(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate category", description = "Deactivate a category")
    public ResponseEntity<Void> deactivateCategory(@PathVariable String id) {
        log.info("REST request to deactivate category with ID: {}", id);
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok().build();
    }
}