package com.tlaq.auth_service.services;

import com.tlaq.auth_service.dto.requests.RoleRequest;
import com.tlaq.auth_service.dto.responses.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse create(RoleRequest request);
    List<RoleResponse> getAll();
    void delete(int id);

    RoleResponse addPermissionsToRole(int roleId, List<Integer> permissionIds);

}
