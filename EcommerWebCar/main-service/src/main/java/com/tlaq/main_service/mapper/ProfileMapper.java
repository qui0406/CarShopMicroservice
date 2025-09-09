package com.tlaq.main_service.mapper;


import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.responses.ProfileResponse;
import com.tlaq.main_service.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    @Mapping(target = "roles", ignore = true)
    Profile toProfile(RegistrationRequest request);

    ProfileResponse toProfileResponse(Profile profile);
}
