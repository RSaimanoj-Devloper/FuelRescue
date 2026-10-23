package in.fuelrescue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FuelRescueApplication {

    public static void main(String[] args) {
        SpringApplication.run(FuelRescueApplication.class, args);
    }
}
