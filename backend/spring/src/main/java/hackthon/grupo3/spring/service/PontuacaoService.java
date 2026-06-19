package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.exception.RecursoNaoEncontradoException;
import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.model.enums.CriterioPontuacao;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import hackthon.grupo3.spring.repository.PalpiteRepository;
import hackthon.grupo3.spring.repository.PartidaRepository;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PontuacaoService {

    private final PartidaRepository partidaRepository;
    private final PalpiteRepository palpiteRepository;
    private final UsuarioRepository usuarioRepository;

    public PontuacaoService(PartidaRepository partidaRepository,
                            PalpiteRepository palpiteRepository,
                            UsuarioRepository usuarioRepository) {
        this.partidaRepository = partidaRepository;
        this.palpiteRepository = palpiteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void lancarResultado(Long partidaId, int golsMandante, int golsVisitante) {
        if (golsMandante < 0 || golsVisitante < 0) {
            throw new IllegalArgumentException("Os gols nao podem ser negativos.");
        }

        Partida partida = partidaRepository.findById(partidaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Partida nao encontrada: " + partidaId));

        partida.setGolsMandante(golsMandante);
        partida.setGolsVisitante(golsVisitante);
        partida.setStatus(StatusPartida.ENCERRADA);
        partidaRepository.save(partida);

        recalcularPontuacao(partida);
    }

    private void recalcularPontuacao(Partida partida) {
        int rm = partida.getGolsMandante();
        int rv = partida.getGolsVisitante();

        List<Palpite> palpites = palpiteRepository.findByPartidaId(partida.getId());

        for (Palpite palpite : palpites) {
            Usuario usuario = palpite.getUsuario();

            int pontuacaoAtual = usuario.getPontuacaoTotal();
            int placaresExatosAtuais = usuario.getPlacaresExatos();

            if (palpite.getPontosObtidos() != null) {
                pontuacaoAtual -= palpite.getPontosObtidos();
                if (palpite.getCriterioAplicado() == CriterioPontuacao.PLACAR_EXATO) {
                    placaresExatosAtuais -= 1;
                }
            }

            int palpiteGolsMandante = palpite.getGolsMandante();
            int palpiteGolsVisitante = palpite.getGolsVisitante();

            int pontos = calcularPontos(palpiteGolsMandante, palpiteGolsVisitante, rm, rv);
            CriterioPontuacao criterio = criterioDe(pontos);

            palpite.setPontosObtidos(pontos);
            palpite.setCriterioAplicado(criterio);

            pontuacaoAtual += pontos;
            if (criterio == CriterioPontuacao.PLACAR_EXATO) {
                placaresExatosAtuais += 1;
            }

            usuario.setPontuacaoTotal(pontuacaoAtual);
            usuario.setPlacaresExatos(placaresExatosAtuais);

            palpiteRepository.save(palpite);
            usuarioRepository.save(usuario);
        }
    }

    private int calcularPontos(int pm, int pv, int rm, int rv) {
        if (pm == rm && pv == rv) {
            return 10;
        }
        if (Integer.signum(pm - pv) == Integer.signum(rm - rv)) {
            return 5;
        }
        return 0;
    }

    private CriterioPontuacao criterioDe(int pontos) {
        return switch (pontos) {
            case 10 -> CriterioPontuacao.PLACAR_EXATO;
            case 5 -> CriterioPontuacao.VENCEDOR;
            default -> CriterioPontuacao.ERRO;
        };
    }
}