package sigac.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Converte DATABASE_URL do Render (postgres://) para JDBC PostgreSQL.
 */
@Configuration
@Profile("prod")
public class RenderDatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL é obrigatória no perfil prod (Render).");
        }

        String normalized = databaseUrl.startsWith("postgres://")
                ? databaseUrl.replace("postgres://", "postgresql://")
                : databaseUrl;
        URI dbUri = URI.create(normalized);

        String userInfo = dbUri.getUserInfo();
        if (userInfo == null || !userInfo.contains(":")) {
            throw new IllegalStateException("DATABASE_URL inválida: credenciais ausentes.");
        }
        String[] parts = userInfo.split(":", 2);
        String username = urlDecode(parts[0]);
        String password = urlDecode(parts[1]);

        String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost()
                + (dbUri.getPort() > 0 ? ":" + dbUri.getPort() : "")
                + dbUri.getPath()
                + "?sslmode=require";

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }

    private static String urlDecode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
