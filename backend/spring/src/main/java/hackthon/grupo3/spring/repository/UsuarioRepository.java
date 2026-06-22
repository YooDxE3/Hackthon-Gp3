package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByUltimoAcessoAfter(LocalDateTime data);

    long countByBloqueadoTrue();
    List<Usuario> findAllByOrderByPontuacaoTotalDescPlacaresExatosDesc();

    Optional<Usuario> findByEmailIgnoreCase(String email);
}