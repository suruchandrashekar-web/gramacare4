package com.gramacare.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gramacare.backend.entity.ServiceRequest;

@Repository
public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    // =====================================================
    // GET REQUESTS CREATED BY A PARTICULAR USER
    // =====================================================

    List<ServiceRequest> findByUserId(Long userId);


    // =====================================================
    // GET REQUESTS FOR SERVICES BELONGING TO A PROVIDER
    // =====================================================

    @Query("""
        SELECT DISTINCT r
        FROM ServiceRequest r
        JOIN r.service s
        JOIN s.provider p
        WHERE p.id = :providerId
        ORDER BY r.createdAt DESC
    """)
    List<ServiceRequest> findRequestsByProviderId(
            @Param("providerId") Long providerId
    );


    // =====================================================
    // DELETE NOTIFICATIONS RELATED TO A SERVICE
    //
    // notifications.request_id
    //        -> service_requests.id
    //
    // First delete notifications because they depend
    // on service_requests.
    // =====================================================

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        DELETE n
        FROM notifications n
        INNER JOIN service_requests r
            ON n.request_id = r.id
        WHERE r.service_id = :serviceId
        """, nativeQuery = true)
    int deleteNotificationsByServiceId(
            @Param("serviceId") Long serviceId
    );


    // =====================================================
    // DELETE ALL SERVICE REQUESTS RELATED TO A SERVICE
    //
    // This must happen after notifications are deleted.
    // =====================================================

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        DELETE FROM ServiceRequest r
        WHERE r.service.id = :serviceId
    """)
    int deleteByServiceId(
            @Param("serviceId") Long serviceId
    );
}