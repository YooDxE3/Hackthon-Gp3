package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartidaRepository extends JpaRepository<Partida, Long> {

    // Voce vai adicionar mais conforme as telas (RF-010/012/013)
    List<Partida> findAllByOrderByDataHoraAsc();

    List<Partida> findByStatus(StatusPartida status);

    long countByStatus(hackthon.grupo3.spring.model.enums.StatusPartida status);
}