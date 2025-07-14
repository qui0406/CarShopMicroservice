package com.tlaq.auth.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.tlaq.auth.dto.request.UserCreationRequest;
import com.tlaq.auth.dto.request.UserUpdateRequest;
import com.tlaq.auth.dto.response.UserResponse;
import com.tlaq.auth.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
