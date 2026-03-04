package com.tlaq.identity_service.repo;

import com.tlaq.identity_service.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {
    Optional<Profile> findByUserKeyCloakId(String userKeyCloakId);
}
