package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.TokenResetSenha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenResetSenhaRepository extends JpaRepository<TokenResetSenha, Long> {

    Optional<TokenResetSenha> findByToken(String token);
}
