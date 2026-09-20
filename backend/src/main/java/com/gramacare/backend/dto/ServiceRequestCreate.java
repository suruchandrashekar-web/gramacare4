package com.gramacare.backend.dto;

import jakarta.validation.constraints.NotNull;

public class ServiceRequestCreate {

    // =====================================================
    // USER ID
    // =====================================================

    @NotNull(message = "User ID is required")
    private Long userId;

    // =====================================================
    // SERVICE ID
    // =====================================================

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    // =====================================================
    // MESSAGE
    // =====================================================

    private String message;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public ServiceRequestCreate() {
    }

    // =====================================================
    // GET USER ID
    // =====================================================

    public Long getUserId() {
        return userId;
    }

    // =====================================================
    // SET USER ID
    // =====================================================

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // =====================================================
    // GET SERVICE ID
    // =====================================================

    public Long getServiceId() {
        return serviceId;
    }

    // =====================================================
    // SET SERVICE ID
    // =====================================================

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    // =====================================================
    // GET MESSAGE
    // =====================================================

    public String getMessage() {
        return message;
    }

    // =====================================================
    // SET MESSAGE
    // =====================================================

    public void setMessage(String message) {
        this.message = message;
    }
}