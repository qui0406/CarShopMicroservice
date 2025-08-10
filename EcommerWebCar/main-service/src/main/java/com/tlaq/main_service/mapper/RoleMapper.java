package com.tlaq.main_service.mapper;


import com.tlaq.main_service.dto.requests.RoleRequest;
import com.tlaq.main_service.dto.responses.RoleResponse;
import com.tlaq.main_service.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
