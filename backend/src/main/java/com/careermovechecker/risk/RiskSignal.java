package com.careermovechecker.risk;

import java.util.Map;

public record RiskSignal(String id, String description, Map<String, Object> evidence) {
}
