package sigac.config;

import sigac.domain.Role;
import sigac.domain.User;
import sigac.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garante o usuário admin padrão do SIGAC (admin@sigac.com / admin123 por padrão).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${sigac.admin.email:}")
    private String adminEmail;

    @Value("${sigac.admin.password:}")
    private String adminPassword;

    @Value("${sigac.admin.ensure-credentials:false}")
    private boolean ensureCredentials;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                existing -> {
                    if (ensureCredentials) {
                        existing.setNome("SIGAC Admin");
                        existing.setRole(Role.SIGAC_ADMIN);
                        existing.setPassword(passwordEncoder.encode(adminPassword));
                        userRepository.save(existing);
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setNome("SIGAC Admin");
                    admin.setEmail(adminEmail);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole(Role.SIGAC_ADMIN);
                    userRepository.save(admin);
                }
        );
    }
}
