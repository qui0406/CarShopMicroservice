package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.Role;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);

    @Query("SELECT p.roles FROM Profile p WHERE p.id = :id")
    Set<Role> findRolesByProfileId(@Param("id") String id);

    @Query("SELECT p.roles FROM Profile p WHERE p.userKeyCloakId = :userKeyCloakId")
    Set<Role> findRolesByUserKeyCloakId(@Param("userKeyCloakId") String userKeyCloakId);
}
