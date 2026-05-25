package com.careermovechecker.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class KillSwitchService {

    private final KillSwitchRepository repo;

    public KillSwitchService(KillSwitchRepository repo) {
        this.repo = repo;
    }

    public List<KillSwitch> all() {
        return repo.findAll();
    }

    public boolean isEnabled(String key) {
        return repo.findById(key).map(KillSwitch::isEnabled).orElse(false);
    }

    @Transactional
    public KillSwitch set(String key, boolean enabled, String reason, String actor) {
        KillSwitch ks = repo.findById(key).orElseGet(() -> {
            KillSwitch k = new KillSwitch();
            k.setKey(key);
            return k;
        });
        ks.setEnabled(enabled);
        ks.setReason(reason);
        ks.setUpdatedBy(actor);
        ks.setUpdatedAt(Instant.now());
        return repo.save(ks);
    }
}
