package sigac.config;

import sigac.domain.Role;
import sigac.domain.User;
import sigac.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@sigac.com").isEmpty()) {
            User admin = new User();
            admin.setNome("SIGAC Admin");
            admin.setEmail("admin@sigac.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.SIGAC_ADMIN);
            userRepository.save(admin);
        }
    }
}
