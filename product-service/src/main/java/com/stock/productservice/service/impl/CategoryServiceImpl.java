package com.stock.productservice.service.impl;

import com.stock.productservice.dto.CategoryCreateRequest;
import com.stock.productservice.dto.CategoryDTO;
import com.stock.productservice.dto.CategoryUpdateRequest;
import com.stock.productservice.entity.Category;
import com.stock.productservice.event.CategoryEvent;
import com.stock.productservice.event.CategoryEventPublisher;
import com.stock.productservice.exception.DuplicateResourceException;
import com.stock.productservice.exception.ResourceNotFoundException;
import com.stock.productservice.repository.CategoryRepository;
import com.stock.productservice.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryEventPublisher eventPublisher;

    @Override
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        log.info("Creating category with name: {}", request.getName());

        // Check if name already exists
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category with name " + request.getName() + " already exists");
        }

        // Verify parent category exists if provided
        if (request.getParentCategoryId() != null) {
            categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found with ID: " + request.getParentCategoryId()));
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parentCategoryId(request.getParentCategoryId())
                .displayOrder(request.getDisplayOrder())
                .attributeSchemas(request.getAttributeSchemas())
                .isActive(true)
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());

        CategoryDTO dto = mapToDTO(savedCategory);

        // Publish event
        CategoryEvent event = CategoryEvent.builder()
                .id(savedCategory.getId())
                .name(savedCategory.getName())
                .parentId(savedCategory.getParentCategoryId())
                .isActive(savedCategory.getIsActive())
                .timestamp(LocalDateTime.now())
                .eventType("CREATED")
                .build();
        eventPublisher.publishCategoryCreated(event);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(String id) {
        log.info("Fetching category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        return mapToDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryByName(String name) {
        log.info("Fetching category with name: {}", name);

        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + name));

        return mapToDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        log.info("Fetching all categories");

        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesByParentId(String parentId) {
        log.info("Fetching categories for parent ID: {}", parentId);

        return categoryRepository.findByParentCategoryId(parentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getRootCategories() {
        log.info("Fetching root categories");

        return categoryRepository.findRootCategories().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getActiveCategories() {
        log.info("Fetching active categories");

        return categoryRepository.findActiveCategories().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO updateCategory(String id, CategoryUpdateRequest request) {
        log.info("Updating category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        // Verify parent category exists if changed
        if (request.getParentCategoryId() != null && !request.getParentCategoryId().equals(category.getParentCategoryId())) {
            categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found with ID: " + request.getParentCategoryId()));
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParentCategoryId(request.getParentCategoryId());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setAttributeSchemas(request.getAttributeSchemas());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully with ID: {}", updatedCategory.getId());

        CategoryDTO dto = mapToDTO(updatedCategory);

        // Publish event
        CategoryEvent event = CategoryEvent.builder()
                .id(updatedCategory.getId())
                .name(updatedCategory.getName())
                .parentId(updatedCategory.getParentCategoryId())
                .isActive(updatedCategory.getIsActive())
                .timestamp(LocalDateTime.now())
                .eventType("UPDATED")
                .build();
        eventPublisher.publishCategoryUpdated(event);

        return dto;
    }

    @Override
    public void deleteCategory(String id) {
        log.info("Deleting category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        categoryRepository.delete(category);
        log.info("Category deleted successfully with ID: {}", id);

        // Publish event
        CategoryEvent event = CategoryEvent.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParentCategoryId())
                .isActive(false)
                .timestamp(LocalDateTime.now())
                .eventType("DELETED")
                .build();
        eventPublisher.publishCategoryDeleted(event);
    }

    @Override
    public void activateCategory(String id) {
        log.info("Activating category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        category.setIsActive(true);
        categoryRepository.save(category);
        log.info("Category activated successfully with ID: {}", id);
    }

    @Override
    public void deactivateCategory(String id) {
        log.info("Deactivating category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        category.setIsActive(false);
        categoryRepository.save(category);
        log.info("Category deactivated successfully with ID: {}", id);
    }

    // Helper methods
    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentCategoryId(category.getParentCategoryId())
                .displayOrder(category.getDisplayOrder())
                .attributeSchemas(category.getAttributeSchemas())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}