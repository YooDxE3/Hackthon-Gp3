package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.TokenResetSenha;
import hackthon.grupo3.spring.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenResetSenhaRepository
        extends JpaRepository<TokenResetSenha, Long> {

    Optional<TokenResetSenha> findByTokenAndUsadoFalse(String token);

    List<TokenResetSenha> findAllByUsuarioAndUsadoFalse(Usuario usuario);
}