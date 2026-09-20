package com.gramacare.backend.dto;

import com.gramacare.backend.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdaterequest {

    // ==============================
    // STATUS
    // ==============================

    @NotNull(message = "Status is required")
    private RequestStatus status;

    // ==============================
    // DEFAULT CONSTRUCTOR
    // ==============================

    public StatusUpdaterequest() {
    }

    // ==============================
    // GET STATUS
    // ==============================

    public RequestStatus getStatus() {
        return status;
    }

    // ==============================
    // SET STATUS
    // ==============================

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}