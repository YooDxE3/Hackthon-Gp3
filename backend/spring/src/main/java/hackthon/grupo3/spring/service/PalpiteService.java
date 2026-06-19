package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.dto.PalpiteRequest;
import hackthon.grupo3.spring.exception.PalpiteBloqueadoException;
import hackthon.grupo3.spring.exception.RecursoNaoEncontradoException;
import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.repository.PalpiteRepository;
import hackthon.grupo3.spring.repository.PartidaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PalpiteService {

    private final PalpiteRepository palpiteRepository;
    private final PartidaRepository partidaRepository;

    public PalpiteService(PalpiteRepository palpiteRepository, PartidaRepository partidaRepository) {
        this.palpiteRepository = palpiteRepository;
        this.partidaRepository = partidaRepository;
    }

    public Palpite registrarOuEditar(Usuario usuario, PalpiteRequest req) {
        Partida partida = partidaRepository.findById(req.partidaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Partida nao encontrada: " + req.partidaId()));

        if (!LocalDateTime.now().isBefore(partida.getDataHora())) {
            throw new PalpiteBloqueadoException("Palpites encerrados: a partida ja comecou.");
        }

        Palpite palpite = palpiteRepository
                .findByUsuarioIdAndPartidaId(usuario.getId(), partida.getId())
                .orElseGet(Palpite::new);

        boolean ehEdicao = (palpite.getId() != null);

        palpite.setUsuario(usuario);
        palpite.setPartida(partida);
        palpite.setGolsMandante(req.golsMandante());
        palpite.setGolsVisitante(req.golsVisitante());
        if (ehEdicao) {
            palpite.setAtualizadoEm(LocalDateTime.now());
        }

        return palpiteRepository.save(palpite);
    }

    public List<Palpite> listarDoUsuario(Long usuarioId) {
        return palpiteRepository.findByUsuarioId(usuarioId);
    }
}
