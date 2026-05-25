package com.careermovechecker.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuditService {

    private final AdminAuditLogRepository repo;
    private final ObjectMapper json;

    public AuditService(AdminAuditLogRepository repo, ObjectMapper json) {
        this.repo = repo;
        this.json = json;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String targetType, String targetId, String summary, Map<String, Object> detail) {
        AdminAuditLog row = new AdminAuditLog();
        row.setActor(currentActor());
        row.setAction(action);
        row.setTargetType(targetType);
        row.setTargetId(targetId);
        row.setSummary(summary);
        try {
            row.setDetailJson(json.writeValueAsString(detail == null ? Map.of() : detail));
        } catch (JsonProcessingException e) {
            row.setDetailJson("{}");
        }
        repo.save(row);
    }

    public Page<AdminAuditLog> recent(int page, int size) {
        return repo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    private String currentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return "anonymous";
        return auth.getName();
    }
}
