package com.gramacare.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gramacare.backend.entity.Role;
import com.gramacare.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // =====================================================
    // FIND USER BY EMAIL
    // =====================================================

    Optional<User> findByEmail(String email);

    // =====================================================
    // FIND USER BY EMAIL - CASE INSENSITIVE
    // Useful for Admin / Google login
    // =====================================================

    Optional<User> findByEmailIgnoreCase(String email);

    // =====================================================
    // CHECK EMAIL EXISTS
    // =====================================================

    boolean existsByEmail(String email);

    // =====================================================
    // FIND USERS BY ROLE
    // =====================================================

    List<User> findByRole(Role role);

    // =====================================================
    // FIND USER BY EMAIL AND BLOCK STATUS
    // =====================================================
    // Useful when Login needs to check whether
    // the account is blocked or active.
    //
    // blocked = false -> Active account
    // blocked = true  -> Blocked account
    // =====================================================

    Optional<User> findByEmailAndBlocked(String email, boolean blocked);

    // =====================================================
    // FIND USERS BY BLOCK STATUS
    // =====================================================
    // Useful for Admin Dashboard.
    // =====================================================

    List<User> findByBlocked(boolean blocked);

    // =====================================================
    // CHECK WHETHER EMAIL BELONGS TO A BLOCKED ACCOUNT
    // =====================================================

    boolean existsByEmailAndBlocked(String email, boolean blocked);
}