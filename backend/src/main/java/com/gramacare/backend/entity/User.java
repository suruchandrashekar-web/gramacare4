package com.gramacare.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // FULL NAME
    // =====================================================

    @Column(nullable = false)
    private String fullName;

    // =====================================================
    // EMAIL
    // =====================================================

    @Column(nullable = false, unique = true)
    private String email;

    // =====================================================
    // PASSWORD
    // =====================================================
    // Password can be accepted from requests,
    // but it will NEVER be returned in API JSON responses.

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    // =====================================================
    // ROLE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // =====================================================
    // PHONE
    // =====================================================

    private String phone;

    // =====================================================
    // ADDRESS
    // =====================================================

    private String address;

    // =====================================================
    // VILLAGE
    // =====================================================

    private String village;

    // =====================================================
    // DISTRICT
    // =====================================================

    private String district;

    // =====================================================
    // STATE
    // =====================================================

    private String state;

    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    // =====================================================
    // BLOCKED
    // =====================================================
    //
    // false = account is active
    // true  = account is completely blocked by admin
    //
    // Admin BLOCK  -> blocked = true
    // Admin UNBLOCK -> blocked = false
    //
    // NOTE:
    // This field stores the account's block status.
    // The Login/Security/Service APIs must check this
    // field to actually prevent a blocked account
    // from using the application.
    // =====================================================

    @Column(nullable = false)
    private boolean blocked = false;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public User() {
    }

    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // GET FULL NAME
    // =====================================================

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    // =====================================================
    // GET EMAIL
    // =====================================================

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // =====================================================
    // GET PASSWORD
    // =====================================================

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // =====================================================
    // GET ROLE
    // =====================================================

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // =====================================================
    // GET PHONE
    // =====================================================

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // =====================================================
    // GET ADDRESS
    // =====================================================

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // =====================================================
    // GET VILLAGE
    // =====================================================

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    // =====================================================
    // GET DISTRICT
    // =====================================================

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    // =====================================================
    // GET STATE
    // =====================================================

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    // =====================================================
    // GET PROFILE IMAGE
    // =====================================================

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    // =====================================================
    // GET BLOCKED
    // =====================================================

    public boolean isBlocked() {
        return blocked;
    }

    // =====================================================
    // SET BLOCKED
    // =====================================================

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }
}