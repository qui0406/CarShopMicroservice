package com.tlaq.auth.mapper;

import org.mapstruct.Mapper;

import com.tlaq.auth.dto.request.PermissionRequest;
import com.tlaq.auth.dto.response.PermissionResponse;
import com.tlaq.auth.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
