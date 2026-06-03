package sigac.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Garante a coluna de categoria nas manutenções e solicitações legadas.
 */
@Component
@Order(1)
public class ManutencaoCategoriaSchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public ManutencaoCategoriaSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureCategoriaColumn("manutencoes");
        ensureCategoriaColumn("solicitacoes_manutencao");
    }

    private void ensureCategoriaColumn(String table) {
        if (!columnExists(table, "categoria")) {
            jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN categoria VARCHAR(30)");
        }
        jdbcTemplate.update("UPDATE " + table + " SET categoria = 'OUTROS' WHERE categoria IS NULL");
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " ALTER COLUMN categoria SET NOT NULL");
        } catch (Exception ignored) {
            // já NOT NULL
        }
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE UPPER(TABLE_NAME) = UPPER(?) AND UPPER(COLUMN_NAME) = UPPER(?)",
                Integer.class,
                table,
                column);
        return count != null && count > 0;
    }
}
