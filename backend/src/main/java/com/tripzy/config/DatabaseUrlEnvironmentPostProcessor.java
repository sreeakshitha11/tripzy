package com.tripzy.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Accepts a database URL in the "service URI" form hosts like Aiven show
 * (mysql://user:password@host:port/db?ssl-mode=REQUIRED) and turns it into the
 * JDBC URL plus username/password Spring expects. JDBC URLs pass through untouched.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String URL_KEY = "spring.datasource.url";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        String url = env.getProperty(URL_KEY);
        if (url == null || !url.startsWith("mysql://")) {
            return;
        }
        URI uri = URI.create(url);
        Map<String, Object> props = new HashMap<>();

        String query = uri.getRawQuery() == null ? "" : uri.getRawQuery()
                // Aiven writes ssl-mode; Connector/J expects sslMode
                .replace("ssl-mode=", "sslMode=");
        int port = uri.getPort() == -1 ? 3306 : uri.getPort();
        props.put(URL_KEY, "jdbc:mysql://" + uri.getHost() + ":" + port + uri.getRawPath()
                + (query.isEmpty() ? "" : "?" + query));

        String userInfo = uri.getRawUserInfo();
        if (userInfo != null) {
            String[] parts = userInfo.split(":", 2);
            props.put("spring.datasource.username", decode(parts[0]));
            if (parts.length > 1) {
                props.put("spring.datasource.password", decode(parts[1]));
            }
        }
        // Highest precedence so these win over the defaults in application.yml
        env.getPropertySources().addFirst(new MapPropertySource("databaseServiceUri", props));
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
