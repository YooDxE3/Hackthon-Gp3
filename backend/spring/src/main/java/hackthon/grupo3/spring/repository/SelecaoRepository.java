package hackthon.grupo3.spring.repository;

import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.model.enums.Grupo;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SelecaoRepository extends JpaRepository<Selecao, Long> {

    @Query("SELECT s FROM Selecao s WHERE :grupo IS NULL OR s.grupo = :grupo")
    List<Selecao> filtrarPorGrupo(@Param("grupo")Grupo grupo, Sort sort);
}