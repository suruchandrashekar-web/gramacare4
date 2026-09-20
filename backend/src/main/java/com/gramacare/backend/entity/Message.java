package com.gramacare.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "messages")
public class Message {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // SENDER
    // =====================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // =====================================================
    // RECEIVER
    // =====================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // =====================================================
    // REQUEST
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = true)
    private ServiceRequest request;

    // =====================================================
    // MESSAGE TEXT
    // =====================================================

    @Column(nullable = false, length = 2000)
    private String message;

    // =====================================================
    // SENDER ROLE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role senderRole;

    // =====================================================
    // RECEIVER ROLE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role receiverRole;

    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =====================================================
    // READ STATUS
    // =====================================================

    @Column(nullable = false)
    private boolean isRead = false;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Message() {
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {
        return id;
    }

    // =====================================================
    // SET ID
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // GET SENDER
    // =====================================================

    public User getSender() {
        return sender;
    }

    // =====================================================
    // SET SENDER
    // =====================================================

    public void setSender(User sender) {
        this.sender = sender;
    }

    // =====================================================
    // GET RECEIVER
    // =====================================================

    public User getReceiver() {
        return receiver;
    }

    // =====================================================
    // SET RECEIVER
    // =====================================================

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    // =====================================================
    // GET REQUEST
    // =====================================================

    public ServiceRequest getRequest() {
        return request;
    }

    // =====================================================
    // SET REQUEST
    // =====================================================

    public void setRequest(ServiceRequest request) {
        this.request = request;
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

    // =====================================================
    // GET SENDER ROLE
    // =====================================================

    public Role getSenderRole() {
        return senderRole;
    }

    // =====================================================
    // SET SENDER ROLE
    // =====================================================

    public void setSenderRole(Role senderRole) {
        this.senderRole = senderRole;
    }

    // =====================================================
    // GET RECEIVER ROLE
    // =====================================================

    public Role getReceiverRole() {
        return receiverRole;
    }

    // =====================================================
    // SET RECEIVER ROLE
    // =====================================================

    public void setReceiverRole(Role receiverRole) {
        this.receiverRole = receiverRole;
    }

    // =====================================================
    // GET CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =====================================================
    // SET CREATED AT
    // =====================================================

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // =====================================================
    // IS READ
    // =====================================================

    public boolean isRead() {
        return isRead;
    }

    // =====================================================
    // SET READ
    // =====================================================

    public void setRead(boolean read) {
        isRead = read;
    }
}