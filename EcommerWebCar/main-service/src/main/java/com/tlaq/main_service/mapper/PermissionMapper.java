package com.tlaq.main_service.mapper;


import com.tlaq.main_service.dto.requests.PermissionRequest;
import com.tlaq.main_service.dto.responses.PermissionResponse;
import com.tlaq.main_service.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
