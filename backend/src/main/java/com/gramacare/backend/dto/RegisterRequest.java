package com.gramacare.backend.dto;

import com.gramacare.backend.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    // =====================================================
    // FULL NAME
    // =====================================================

    @NotBlank(message = "Full name is required")
    private String fullName;

    // =====================================================
    // EMAIL
    // =====================================================

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    // =====================================================
    // PASSWORD
    // =====================================================

    @NotBlank(message = "Password is required")
    @Size(
        min = 6,
        message = "Password must be at least 6 characters"
    )
    private String password;

    // =====================================================
    // ROLE
    // =====================================================

    @NotNull(message = "Role is required")
    private Role role;

    // =====================================================
    // PHONE
    // =====================================================

    private String phone;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public RegisterRequest() {
    }

    // =====================================================
    // GET FULL NAME
    // =====================================================

    public String getFullName() {
        return fullName;
    }

    // =====================================================
    // SET FULL NAME
    // =====================================================

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    // =====================================================
    // GET EMAIL
    // =====================================================

    public String getEmail() {
        return email;
    }

    // =====================================================
    // SET EMAIL
    // =====================================================

    public void setEmail(String email) {
        this.email = email;
    }

    // =====================================================
    // GET PASSWORD
    // =====================================================

    public String getPassword() {
        return password;
    }

    // =====================================================
    // SET PASSWORD
    // =====================================================

    public void setPassword(String password) {
        this.password = password;
    }

    // =====================================================
    // GET ROLE
    // =====================================================

    public Role getRole() {
        return role;
    }

    // =====================================================
    // SET ROLE
    // =====================================================

    public void setRole(Role role) {
        this.role = role;
    }

    // =====================================================
    // GET PHONE
    // =====================================================

    public String getPhone() {
        return phone;
    }

    // =====================================================
    // SET PHONE
    // =====================================================

    public void setPhone(String phone) {
        this.phone = phone;
    }
}