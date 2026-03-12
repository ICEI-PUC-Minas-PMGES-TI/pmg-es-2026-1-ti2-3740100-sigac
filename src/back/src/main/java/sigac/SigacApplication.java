package sigac;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SigacApplication {

    public static void main(String[] args) {
        SpringApplication.run(SigacApplication.class, args);
    }
}
