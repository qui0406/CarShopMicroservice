package com.tlaq.auth_service.mapper;

import com.tlaq.auth_service.dto.requests.RegistrationRequest;
import com.tlaq.auth_service.dto.responses.RegistrationResponse;
import com.tlaq.auth_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "avatar", ignore = true)
    User toUser(RegistrationRequest request);
    RegistrationResponse toUserResponse(User user);
}
