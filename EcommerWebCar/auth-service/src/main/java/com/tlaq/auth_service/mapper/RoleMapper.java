package com.tlaq.auth_service.mapper;


import com.tlaq.auth_service.dto.requests.RoleRequest;
import com.tlaq.auth_service.dto.responses.RoleResponse;
import com.tlaq.auth_service.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
