package com.careermovechecker.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class SettingsService {

    private final AppSettingRepository repo;

    public SettingsService(AppSettingRepository repo) {
        this.repo = repo;
    }

    public List<AppSetting> all() {
        return repo.findAll();
    }

    public Optional<AppSetting> get(String key) {
        return repo.findById(key);
    }

    public Optional<String> getString(String key) {
        return get(key).map(AppSetting::getValue);
    }

    public Optional<Long> getLong(String key) {
        return get(key).flatMap(s -> {
            try { return Optional.of(Long.parseLong(s.getValue())); }
            catch (Exception e) { return Optional.empty(); }
        });
    }

    @Transactional
    public AppSetting update(String key, String value, String actor) {
        AppSetting s = repo.findById(key).orElseThrow(() -> new IllegalArgumentException("Unknown setting: " + key));
        validate(s, value);
        s.setValue(value);
        s.setUpdatedBy(actor);
        s.setUpdatedAt(Instant.now());
        return repo.save(s);
    }

    private void validate(AppSetting s, String value) {
        switch (s.getValueType()) {
            case LONG -> Long.parseLong(value);
            case DOUBLE -> Double.parseDouble(value);
            case BOOLEAN -> {
                if (!"true".equalsIgnoreCase(value) && !"false".equalsIgnoreCase(value))
                    throw new IllegalArgumentException("Must be true or false");
            }
            case STRING -> { /* ok */ }
        }
    }
}
