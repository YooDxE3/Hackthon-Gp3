package hackthon.grupo3.spring.model;

import hackthon.grupo3.spring.model.enums.Fase;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Entity
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Selecao mandante;

    @ManyToOne
    private Selecao visitante;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime dataHora;

    private String estadio;

    @Enumerated(EnumType.STRING)
    private Fase fase;

    private String grupo;

    @Enumerated(EnumType.STRING)
    private StatusPartida status = StatusPartida.AGENDADA;

    private Integer golsMandante;

    private Integer golsVisitante;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Selecao getMandante() {
        return mandante;
    }

    public void setMandante(Selecao mandante) {
        this.mandante = mandante;
    }

    public Selecao getVisitante() {
        return visitante;
    }

    public void setVisitante(Selecao visitante) {
        this.visitante = visitante;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getEstadio() {
        return estadio;
    }

    public void setEstadio(String estadio) {
        this.estadio = estadio;
    }

    public Fase getFase() {
        return fase;
    }

    public void setFase(Fase fase) {
        this.fase = fase;
    }

    public String getGrupo() {
        return grupo;
    }

    public void setGrupo(String grupo) {
        this.grupo = grupo;
    }

    public StatusPartida getStatus() {
        if (this.status == StatusPartida.ENCERRADA) {
            return this.status;
        }
        if (this.dataHora != null && java.time.LocalDateTime.now().isAfter(this.dataHora)) {
            return StatusPartida.EM_ANDAMENTO;
        }
        return this.status;
    }

    public void setStatus(StatusPartida status) {
        this.status = status;
    }

    public Integer getGolsMandante() {
        return golsMandante;
    }

    public void setGolsMandante(Integer golsMandante) {
        this.golsMandante = golsMandante;
    }

    public Integer getGolsVisitante() {
        return golsVisitante;
    }

    public void setGolsVisitante(Integer golsVisitante) {
        this.golsVisitante = golsVisitante;
    }
}
