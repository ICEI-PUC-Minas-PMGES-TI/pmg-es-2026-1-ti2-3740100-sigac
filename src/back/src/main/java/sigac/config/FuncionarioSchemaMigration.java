package sigac.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Garante colunas email/cpf em funcionários legados (Hibernate ddl-auto falha ao adicionar NOT NULL com linhas existentes).
 */
@Component
@Order(0)
public class FuncionarioSchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public FuncionarioSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        if (!columnExists("funcionarios", "email")) {
            jdbcTemplate.execute("ALTER TABLE funcionarios ADD COLUMN email VARCHAR(255)");
        }
        if (!columnExists("funcionarios", "cpf")) {
            jdbcTemplate.execute("ALTER TABLE funcionarios ADD COLUMN cpf VARCHAR(11)");
        }
        jdbcTemplate.update(
                "UPDATE funcionarios SET email = CONCAT('funcionario', id, '@legacy.sigac.local') WHERE email IS NULL");
        jdbcTemplate.update(
                "UPDATE funcionarios SET cpf = LPAD(CAST(id AS VARCHAR), 11, '0') WHERE cpf IS NULL");
        if (columnExists("funcionarios", "email")) {
            try {
                jdbcTemplate.execute("ALTER TABLE funcionarios ALTER COLUMN email SET NOT NULL");
            } catch (Exception ignored) {
                // já NOT NULL
            }
        }
        if (columnExists("funcionarios", "cpf")) {
            try {
                jdbcTemplate.execute("ALTER TABLE funcionarios ALTER COLUMN cpf SET NOT NULL");
            } catch (Exception ignored) {
                // já NOT NULL
            }
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
