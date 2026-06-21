package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.model.enums.Fase;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import hackthon.grupo3.spring.repository.PartidaRepository;
import hackthon.grupo3.spring.repository.SelecaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PartidaService {

    private final PartidaRepository partidaRepository;
    private final SelecaoRepository selecaoRepository;

    public PartidaService(PartidaRepository partidaRepository, SelecaoRepository selecaoRepository) {
        this.partidaRepository = partidaRepository;
        this.selecaoRepository = selecaoRepository;
    }

    public List<Partida> listar() {
        return partidaRepository.findAll();
    }

    public Partida buscarPorId(Long id) {
        return partidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partida não encontrada"));
    }

    public Partida salvar(Partida partida) {
        if (partida.getMandante() != null && partida.getMandante().getId() != null) {
            Selecao selecaoA = selecaoRepository.findById(partida.getMandante().getId())
                    .orElseThrow(() -> new RuntimeException("Seleção mandante não encontrada"));
            partida.setMandante(selecaoA);
        }

        if (partida.getVisitante() != null && partida.getVisitante().getId() != null) {
            Selecao selecaoB = selecaoRepository.findById(partida.getVisitante().getId())
                    .orElseThrow(() -> new RuntimeException("Seleção visitante não encontrada"));
            partida.setVisitante(selecaoB);
        }
        //garante que as seleções não sejam as mesmas
        if (partida.getMandante() != null && partida.getVisitante() != null && partida.getMandante().getId().equals(partida.getVisitante().getId())){
            throw new IllegalArgumentException("A seleção mandante não pode ser a mesma que a visitante");
        }
        //se criar uma partida em uma data passada ele automaticamente entra como ENCERRADA, se for para o futuro ela entra como AGENDADA
        if (partida.getDataHora() != null && partida.getDataHora().isBefore(LocalDateTime.now())){
            partida.setStatus(StatusPartida.ENCERRADA);
        } else if (partida.getStatus() == null) {
            partida.setStatus(StatusPartida.AGENDADA);
        }

        return partidaRepository.save(partida);
    }

    public Partida lancarResultado(Long id, Integer golsA, Integer golsB) {
        Partida partida = buscarPorId(id);

        partida.setGolsMandante(golsA);
        partida.setGolsVisitante(golsB);
        partida.setStatus(StatusPartida.ENCERRADA);

        return partidaRepository.save(partida);
    }

    public List<Partida> filtrarPartidas(Long paisId, Fase fase, StatusPartida status) {
        return partidaRepository.filtrarPartidas(paisId, fase, status);
    }
    public void remover(Long id) {
        partidaRepository.deleteById(id);
    }
}
