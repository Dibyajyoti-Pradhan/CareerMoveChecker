package com.careermovechecker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cmc.admin")
public class AdminProperties {
    private String password = "change_me_local";
    public String getPassword() { return password; }
    public void setPassword(String v) { password = v; }
}
