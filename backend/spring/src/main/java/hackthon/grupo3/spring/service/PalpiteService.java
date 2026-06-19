package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.model.enums.CriterioPontuacao;
import hackthon.grupo3.spring.repository.PalpiteRepository;
import hackthon.grupo3.spring.repository.PartidaRepository;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PalpiteService {

    private final PalpiteRepository palpiteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PartidaRepository partidaRepository;

    public PalpiteService(
            PalpiteRepository palpiteRepository,
            UsuarioRepository usuarioRepository,
            PartidaRepository partidaRepository
    ) {
        this.palpiteRepository = palpiteRepository;
        this.usuarioRepository = usuarioRepository;
        this.partidaRepository = partidaRepository;
    }

    public List<Palpite> listar() {
        return palpiteRepository.findAll();
    }

    public Palpite buscarPorId(Long id) {
        return palpiteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Palpite não encontrado"));
    }

    public List<Palpite> listarPorUsuario(Long usuarioId) {
        return palpiteRepository.findByUsuarioId(usuarioId);
    }

    public Palpite salvar(Palpite palpite) {
        if (palpite.getUsuario() == null || palpite.getUsuario().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o usuário do palpite");
        }

        if (palpite.getPartida() == null || palpite.getPartida().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a partida do palpite");
        }

        Usuario usuario = usuarioRepository.findById(palpite.getUsuario().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Partida partida = partidaRepository.findById(palpite.getPartida().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partida não encontrada"));

        if (Boolean.TRUE.equals(usuario.getBloqueado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário bloqueado");
        }

        if (!LocalDateTime.now().isBefore(partida.getDataHora())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Não é possível palpitar após o início da partida");
        }

        if (palpite.getId() == null) {
            boolean jaExiste = palpiteRepository
                    .findByUsuarioIdAndPartidaId(usuario.getId(), partida.getId())
                    .isPresent();

            if (jaExiste) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Usuário já possui palpite para esta partida");
            }
        }

        palpite.setUsuario(usuario);
        palpite.setPartida(partida);
        palpite.setPontosObtidos(0);
        palpite.setCriterioAplicado(CriterioPontuacao.PLACAR_EXATO);
        palpite.setAtualizadoEm(LocalDateTime.now());

        return palpiteRepository.save(palpite);
    }

    public Palpite alterar(Long id, Palpite dados) {
        Palpite palpite = buscarPorId(id);

        if (!LocalDateTime.now().isBefore(palpite.getPartida().getDataHora())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Não é possível editar após o início da partida");
        }

        palpite.setGolsMandante(dados.getGolsMandante());
        palpite.setGolsVisitante(dados.getGolsVisitante());
        palpite.setAtualizadoEm(LocalDateTime.now());

        return palpiteRepository.save(palpite);
    }

    public void remover(Long id) {
        palpiteRepository.deleteById(id);
    }
}
