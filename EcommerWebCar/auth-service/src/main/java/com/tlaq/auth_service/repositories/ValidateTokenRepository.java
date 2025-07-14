
package com.tlaq.auth_service.repositories;

import com.tlaq.auth_service.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidateTokenRepository extends JpaRepository<InvalidatedToken, String> {

}
