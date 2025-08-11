package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {
    Optional<Profile> findByUserKeyCloakId(String userKeyCloakId);
}
