package in.fuelrescue.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "assistance_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistanceRequest {

    @Id
    @Column(length = 64)
    private String id; // Server assigned ID: e.g. FR-2026-8920

    @NotBlank
    @Column(name = "client_request_id", unique = true, nullable = false, length = 128)
    private String clientRequestId; // Client-generated UUID for offline idempotency

    @NotBlank
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "vehicle_id", length = 64)
    private String vehicleId;

    @NotBlank
    @Column(name = "vehicle_number", nullable = false, length = 30)
    private String vehicleNumber;

    @NotBlank
    @Column(name = "fuel_type", nullable = false, length = 15)
    private String fuelType; // PETROL or DIESEL

    @NotNull
    @DecimalMin("1.00")
    @DecimalMax("25.00")
    @Column(name = "requested_quantity", nullable = false, precision = 5, scale = 2)
    private BigDecimal requestedQuantity;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @NotBlank
    @Column(name = "location_description", nullable = false, length = 500)
    private String locationDescription;

    @Column(name = "situation_notes", columnDefinition = "TEXT")
    private String situationNotes;

    @NotBlank
    @Column(name = "request_status", nullable = false, length = 30)
    private String requestStatus;

    @NotBlank
    @Column(name = "sync_status", nullable = false, length = 20)
    private String syncStatus;

    @NotNull
    @Column(name = "estimated_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "confirmed_cost", precision = 10, scale = 2)
    private BigDecimal confirmedCost;

    @Column(name = "assigned_provider_id", length = 64)
    private String assignedProviderId;

    @Column(name = "outlet_source_id", length = 64)
    private String outletSourceId;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @NotBlank
    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "sync_retry_count")
    @Builder.Default
    private Integer syncRetryCount = 0;

    @Column(name = "last_sync_error", columnDefinition = "TEXT")
    private String lastSyncError;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "synchronized_at")
    private Instant synchronizedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
