package com.stock.authservice.controller;

import com.stock.authservice.dto.request.PermissionCreateRequest;
import com.stock.authservice.dto.response.ApiResponse;
import com.stock.authservice.dto.response.PageResponse;
import com.stock.authservice.dto.response.PermissionResponse;
import com.stock.authservice.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Permission Management", description = "Permission management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class PermissionController {

    private final PermissionService permissionService;

    // ==================== CREATE PERMISSION ====================

    @PostMapping
    @Operation(summary = "Create permission", description = "Create a new permission")
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(
            @Valid @RequestBody PermissionCreateRequest request) {
        log.info("POST /api/permissions - Create permission: {}", request.getName());

        ApiResponse<PermissionResponse> response = permissionService.createPermission(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create bulk permissions", description = "Create multiple permissions at once")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> createBulkPermissions(
            @Valid @RequestBody List<PermissionCreateRequest> requests) {
        log.info("POST /api/permissions/bulk - Create {} permissions", requests.size());

        ApiResponse<List<PermissionResponse>> response = permissionService.createBulkPermissions(requests);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==================== GET PERMISSION ====================

    @GetMapping("/{id}")
    @Operation(summary = "Get permission by ID", description = "Get permission details by ID")
    public ResponseEntity<PermissionResponse> getPermissionById(@PathVariable String id) {
        log.info("GET /api/permissions/{} - Get permission by ID", id);

        PermissionResponse response = permissionService.getPermissionById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get permission by name", description = "Get permission details by name")
    public ResponseEntity<PermissionResponse> getPermissionByName(@PathVariable String name) {
        log.info("GET /api/permissions/name/{} - Get permission by name", name);

        PermissionResponse response = permissionService.getPermissionByName(name);

        return ResponseEntity.ok(response);
    }

    // ==================== LIST PERMISSIONS ====================

    @GetMapping
    @Operation(summary = "Get all permissions", description = "Get paginated list of all permissions")
    public ResponseEntity<PageResponse<PermissionResponse>> getAllPermissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        log.info("GET /api/permissions - Get all permissions - page: {}, size: {}", page, size);

        PageResponse<PermissionResponse> response = permissionService.getAllPermissions(
                page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get permissions by category", description = "Get all permissions in a category")
    public ResponseEntity<List<PermissionResponse>> getPermissionsByCategory(@PathVariable String category) {
        log.info("GET /api/permissions/category/{} - Get permissions by category", category);

        List<PermissionResponse> response = permissionService.getPermissionsByCategory(category);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/resource-type/{resourceType}")
    @Operation(summary = "Get permissions by resource type", description = "Get all permissions for a resource type")
    public ResponseEntity<List<PermissionResponse>> getPermissionsByResourceType(@PathVariable String resourceType) {
        log.info("GET /api/permissions/resource-type/{} - Get permissions by resource type", resourceType);

        List<PermissionResponse> response = permissionService.getPermissionsByResourceType(resourceType);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/custom")
    @Operation(summary = "Get custom permissions", description = "Get all custom (non-system) permissions")
    public ResponseEntity<List<PermissionResponse>> getCustomPermissions() {
        log.info("GET /api/permissions/custom - Get custom permissions");

        List<PermissionResponse> response = permissionService.getCustomPermissions();

        return ResponseEntity.ok(response);
    }

    // ==================== UPDATE PERMISSION ====================

    @PutMapping("/{id}")
    @Operation(summary = "Update permission", description = "Update permission details")
    public ResponseEntity<ApiResponse<PermissionResponse>> updatePermission(
            @PathVariable String id,
            @Valid @RequestBody PermissionCreateRequest request) {
        log.info("PUT /api/permissions/{} - Update permission", id);

        ApiResponse<PermissionResponse> response = permissionService.updatePermission(id, request);

        return ResponseEntity.ok(response);
    }

    // ==================== DELETE PERMISSION ====================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete permission", description = "Delete permission by ID")
    public ResponseEntity<ApiResponse<Void>> deletePermission(@PathVariable String id) {
        log.info("DELETE /api/permissions/{} - Delete permission", id);

        ApiResponse<Void> response = permissionService.deletePermission(id);

        return ResponseEntity.ok(response);
    }
}
