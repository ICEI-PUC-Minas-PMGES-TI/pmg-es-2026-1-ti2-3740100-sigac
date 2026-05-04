package sigac.config;

import sigac.domain.Role;
import sigac.domain.User;
import sigac.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${sigac.admin.email:}")
    private String adminEmail;

    @Value("${sigac.admin.password:}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Cria usuário administrador inicial apenas se e-mail e senha forem configurados via propriedades.
        if (adminEmail != null && !adminEmail.isBlank()
                && adminPassword != null && !adminPassword.isBlank()
                && userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setNome("SIGAC Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.SIGAC_ADMIN);
            userRepository.save(admin);
        }
    }
}
