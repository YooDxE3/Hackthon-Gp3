package hackthon.grupo3.spring.config;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.model.enums.Perfil;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@unialfa.edu.br";

        if(!usuarioRepository.existsByEmail(adminEmail)){
            Usuario admin = new Usuario();
            admin.setNome("default admin");
            admin.setEmail(adminEmail);
            admin.setSenha(passwordEncoder.encode("admin123")); // trocar senha dentro do sistema
            admin.setPerfil(Perfil.ADMIN);
            admin.setCriadoEm(LocalDateTime.now());

            usuarioRepository.save(admin);
            System.out.println("Usuário ADMIN criado com sucesso");
        }
    }
}
