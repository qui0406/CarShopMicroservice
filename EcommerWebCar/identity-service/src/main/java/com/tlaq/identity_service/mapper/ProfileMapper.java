package com.tlaq.identity_service.mapper;


import com.tlaq.identity_service.dto.request.RegistrationRequest;
import com.tlaq.identity_service.dto.request.StaffRegistrationRequest;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.entity.Profile;
import com.tlaq.identity_service.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    @Mapping(target = "roles", ignore = true)
    Profile toProfile(RegistrationRequest request);

    ProfileResponse toProfileResponse(Profile profile);

    default String map(Role role) {
        return role.getName();
    }

    Profile toProfileStaff(StaffRegistrationRequest request);

}
