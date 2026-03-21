package com.stock.movementservice.repository;

import com.stock.movementservice.entity.MovementTask;
import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.entity.enums.TaskType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MovementTaskRepository extends JpaRepository<MovementTask, UUID> {

    // ===== Basic Queries =====

    /**
     * Find all tasks for a movement
     */
    List<MovementTask> findByMovement_Id(UUID movementId);

    /**
     * Find tasks by movement with pagination
     */
    Page<MovementTask> findByMovement_Id(UUID movementId, Pageable pageable);

    /**
     * Find tasks by movement line
     */
    List<MovementTask> findByMovementLineId(UUID movementLineId);

    // ===== User-based Queries =====

    /**
     * Find tasks assigned to a user
     */
    List<MovementTask> findByAssignedUserId(UUID userId);

    /**
     * Find tasks assigned to user with pagination
     */
    Page<MovementTask> findByAssignedUserId(UUID userId, Pageable pageable);

    /**
     * Find tasks by user and status
     */
    List<MovementTask> findByAssignedUserIdAndStatus(UUID userId, TaskStatus status);

    /**
     * Find unassigned tasks
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.assignedUserId IS NULL")
    List<MovementTask> findUnassignedTasks();

    /**
     * Find unassigned tasks with pagination
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.assignedUserId IS NULL")
    Page<MovementTask> findUnassignedTasks(Pageable pageable);

    // ===== Status-based Queries =====

    /**
     * Find tasks by status
     */
    List<MovementTask> findByStatus(TaskStatus status);

    /**
     * Find tasks by status with pagination
     */
    Page<MovementTask> findByStatus(TaskStatus status, Pageable pageable);

    /**
     * Find tasks by multiple statuses
     */
    List<MovementTask> findByStatusIn(List<TaskStatus> statuses);

    /**
     * Find pending and assigned tasks
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.status IN ('PENDING', 'ASSIGNED')")
    List<MovementTask> findActiveTasks();

    // ===== Type-based Queries =====

    /**
     * Find tasks by type
     */
    List<MovementTask> findByTaskType(TaskType taskType);

    /**
     * Find tasks by type and status
     */
    List<MovementTask> findByTaskTypeAndStatus(TaskType taskType, TaskStatus status);

    /**
     * Find tasks by user and type
     */
    List<MovementTask> findByAssignedUserIdAndTaskType(UUID userId, TaskType taskType);

    // ===== Location-based Queries =====

    /**
     * Find tasks by location
     */
    List<MovementTask> findByLocationId(UUID locationId);

    /**
     * Find tasks by location and status
     */
    List<MovementTask> findByLocationIdAndStatus(UUID locationId, TaskStatus status);

    // ===== Date/Time-based Queries =====

    /**
     * Find overdue tasks
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.expectedCompletionTime < :currentTime " +
            "AND mt.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<MovementTask> findOverdueTasks(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Find tasks scheduled for today
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.scheduledStartTime BETWEEN :startOfDay AND :endOfDay")
    List<MovementTask> findTasksScheduledForToday(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /**
     * Find tasks scheduled within date range
     */
    List<MovementTask> findByScheduledStartTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find completed tasks within date range
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.status = 'COMPLETED' " +
            "AND mt.actualCompletionTime BETWEEN :startDate AND :endDate")
    List<MovementTask> findCompletedTasksBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ===== Priority-based Queries =====

    /**
     * Find high priority tasks
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.priority >= :minPriority " +
            "AND mt.status IN ('PENDING', 'ASSIGNED') ORDER BY mt.priority DESC")
    List<MovementTask> findHighPriorityTasks(@Param("minPriority") Integer minPriority);

    /**
     * Find tasks ordered by priority
     */
    @Query("SELECT mt FROM MovementTask mt WHERE mt.status IN ('PENDING', 'ASSIGNED') " +
            "ORDER BY mt.priority DESC, mt.scheduledStartTime ASC")
    List<MovementTask> findTasksOrderedByPriority();

    // ===== Statistics and Aggregation =====

    /**
     * Count tasks by movement
     */
    long countByMovement_Id(UUID movementId);

    /**
     * Count tasks by movement and status
     */
    long countByMovement_IdAndStatus(UUID movementId, TaskStatus status);

    /**
     * Count tasks assigned to user
     */
    long countByAssignedUserId(UUID userId);

    /**
     * Count pending tasks for user
     */
    @Query("SELECT COUNT(mt) FROM MovementTask mt WHERE mt.assignedUserId = :userId " +
            "AND mt.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')")
    long countPendingTasksByUser(@Param("userId") UUID userId);

    /**
     * Get task statistics by status
     */
    @Query("SELECT mt.status, COUNT(mt) FROM MovementTask mt GROUP BY mt.status")
    List<Object[]> getTaskStatisticsByStatus();

    /**
     * Get task statistics by type
     */
    @Query("SELECT mt.taskType, COUNT(mt) FROM MovementTask mt GROUP BY mt.taskType")
    List<Object[]> getTaskStatisticsByType();

    /**
     * Get user task performance (completed tasks count)
     */
    @Query("SELECT mt.assignedUserId, COUNT(mt) FROM MovementTask mt WHERE mt.status = 'COMPLETED' " +
            "AND mt.actualCompletionTime BETWEEN :startDate AND :endDate GROUP BY mt.assignedUserId")
    List<Object[]> getUserTaskPerformance(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ===== Complex Queries =====

    /**
     * Find task with movement details
     */
    @Query("SELECT mt FROM MovementTask mt JOIN FETCH mt.movement WHERE mt.id = :id")
    Optional<MovementTask> findByIdWithMovement(@Param("id") UUID id);

    /**
     * Find tasks for warehouse (through movement)
     */
    @Query("SELECT mt FROM MovementTask mt JOIN mt.movement m WHERE m.warehouseId = :warehouseId")
    List<MovementTask> findByWarehouse(@Param("warehouseId") UUID warehouseId);

    /**
     * Find active tasks for warehouse
     */
    @Query("SELECT mt FROM MovementTask mt JOIN mt.movement m WHERE m.warehouseId = :warehouseId " +
            "AND mt.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')")
    List<MovementTask> findActiveTasksByWarehouse(@Param("warehouseId") UUID warehouseId);

    /**
     * Find user's tasks for today in specific warehouse
     */
    @Query("SELECT mt FROM MovementTask mt JOIN mt.movement m WHERE mt.assignedUserId = :userId " +
            "AND m.warehouseId = :warehouseId " +
            "AND mt.scheduledStartTime BETWEEN :startOfDay AND :endOfDay " +
            "ORDER BY mt.priority DESC, mt.scheduledStartTime ASC")
    List<MovementTask> findUserTasksForToday(
            @Param("userId") UUID userId,
            @Param("warehouseId") UUID warehouseId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    // ===== Deletion Queries =====

    /**
     * Delete all tasks for a movement
     */
    void deleteByMovement_Id(UUID movementId);

    /**
     * Delete tasks by status
     */
    void deleteByStatus(TaskStatus status);
}
