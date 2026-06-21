package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.enums.Fase;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PartidaRepository extends JpaRepository<Partida, Long> {

    // Voce vai adicionar mais conforme as telas (RF-010/012/013)
    List<Partida> findAllByOrderByDataHoraAsc();

    List<Partida> findByStatus(StatusPartida status);

    long countByStatus(hackthon.grupo3.spring.model.enums.StatusPartida status);

    @Query("SELECT p FROM Partida p WHERE " +
            "(:paisId IS NULL OR p.mandante.id = :paisId OR p.visitante.id = :paisId) AND " +
            "(:fase IS NULL OR p.fase = :fase) AND " +
            "(:status IS NULL OR p.status = :status) " +
            "ORDER BY p.dataHora ASC")
    List<Partida> filtrarPartidas(@Param("paisId") Long paisId, @Param("fase") Fase fase, @Param("status") StatusPartida status);

}