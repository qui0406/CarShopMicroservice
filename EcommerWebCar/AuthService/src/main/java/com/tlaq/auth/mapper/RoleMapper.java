package com.tlaq.auth.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tlaq.auth.dto.request.RoleRequest;
import com.tlaq.auth.dto.response.RoleResponse;
import com.tlaq.auth.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
