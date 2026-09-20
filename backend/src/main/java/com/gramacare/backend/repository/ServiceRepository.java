package com.gramacare.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gramacare.backend.entity.ServiceEntity;

@Repository
public interface ServiceRepository
        extends JpaRepository<ServiceEntity, Long> {

    // ==============================
    // GET AVAILABLE SERVICES
    // ==============================

    List<ServiceEntity> findByAvailableTrue();

    // ==============================
    // GET SERVICES BY PROVIDER
    // ==============================

    List<ServiceEntity> findByProviderId(Long providerId);
}