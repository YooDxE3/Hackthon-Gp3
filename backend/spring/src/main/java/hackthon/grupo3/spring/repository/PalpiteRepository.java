package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.Palpite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PalpiteRepository extends JpaRepository<Palpite, Long> {

    List<Palpite> findByPartidaId(Long partidaId);

    List<Palpite> findByUsuarioId(Long usuarioId);

    Optional<Palpite> findByUsuarioIdAndPartidaId(Long usuarioId, Long partidaId);
}
