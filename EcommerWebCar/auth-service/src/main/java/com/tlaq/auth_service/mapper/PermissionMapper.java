package com.tlaq.auth_service.mapper;


import com.tlaq.auth_service.dto.requests.PermissionRequest;
import com.tlaq.auth_service.dto.responses.PermissionResponse;
import com.tlaq.auth_service.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
