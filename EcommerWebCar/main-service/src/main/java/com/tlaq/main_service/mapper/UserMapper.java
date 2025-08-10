package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.UserDTO;
import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.requests.UserUpdateRequest;
import com.tlaq.main_service.dto.responses.RegistrationResponse;
import com.tlaq.main_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "avatar", ignore = true)
    User toUser(RegistrationRequest request);
    RegistrationResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);

    UserDTO toUserDTO(User user);
}
