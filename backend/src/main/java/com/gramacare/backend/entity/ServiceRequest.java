package com.gramacare.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    // ==============================
    // ID
    // ==============================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==============================
    // USER
    // ==============================

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ==============================
    // SERVICE
    // ==============================

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    // ==============================
    // MESSAGE
    // ==============================

    @Column(length = 1000)
    private String message;

    // ==============================
    // REQUEST STATUS
    // ==============================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    // ==============================
    // CREATED DATE
    // ==============================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // ==============================
    // DEFAULT CONSTRUCTOR
    // ==============================

    public ServiceRequest() {
        this.createdAt = LocalDateTime.now();
    }

    // ==============================
    // GET ID
    // ==============================

    public Long getId() {
        return id;
    }

    // ==============================
    // SET ID
    // ==============================

    public void setId(Long id) {
        this.id = id;
    }

    // ==============================
    // GET USER
    // ==============================

    public User getUser() {
        return user;
    }

    // ==============================
    // SET USER
    // ==============================

    public void setUser(User user) {
        this.user = user;
    }

    // ==============================
    // GET SERVICE
    // ==============================

    public ServiceEntity getService() {
        return service;
    }

    // ==============================
    // SET SERVICE
    // ==============================

    public void setService(ServiceEntity service) {
        this.service = service;
    }

    // ==============================
    // GET MESSAGE
    // ==============================

    public String getMessage() {
        return message;
    }

    // ==============================
    // SET MESSAGE
    // ==============================

    public void setMessage(String message) {
        this.message = message;
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

    // ==============================
    // GET CREATED AT
    // ==============================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ==============================
    // SET CREATED AT
    // ==============================

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}