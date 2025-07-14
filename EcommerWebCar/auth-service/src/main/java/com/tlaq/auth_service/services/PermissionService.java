package com.tlaq.auth_service.services;

import com.tlaq.auth_service.dto.requests.PermissionRequest;
import com.tlaq.auth_service.dto.responses.PermissionResponse;

import java.util.List;

public interface PermissionService {
    PermissionResponse create(PermissionRequest request);
    List<PermissionResponse> getAll();
    void delete(int id);
}
