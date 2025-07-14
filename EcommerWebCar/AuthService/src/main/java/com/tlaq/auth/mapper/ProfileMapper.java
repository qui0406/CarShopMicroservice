package com.tlaq.auth.mapper;

import org.mapstruct.Mapper;

import com.tlaq.auth.dto.request.ProfileCreationRequest;
import com.tlaq.auth.dto.request.UserCreationRequest;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}
