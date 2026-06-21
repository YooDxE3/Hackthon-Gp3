package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import hackthon.grupo3.spring.repository.PalpiteRepository;
import hackthon.grupo3.spring.repository.PartidaRepository;
import hackthon.grupo3.spring.repository.SelecaoRepository;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;
import java.util.List;

@Controller
public class DashboardController {

        private final UsuarioRepository usuarioRepository;
        private final PartidaRepository partidaRepository;
        private  final SelecaoRepository selecaoRepository;
        private final PalpiteRepository palpiteRepository;

        public DashboardController(UsuarioRepository usuarioRepository , PartidaRepository partidaRepository, SelecaoRepository selecaoRepository, PalpiteRepository palpiteRepository){
            this.usuarioRepository = usuarioRepository;
            this.partidaRepository = partidaRepository;
            this.selecaoRepository = selecaoRepository;
            this.palpiteRepository = palpiteRepository;
        }

    @GetMapping({"/", "/dashboard"})
    public String dashboard(Model model) {
        LocalDateTime ultimas24h = LocalDateTime.now().minusHours(24);

        // --- OBRIGATÓRIOS ---
        model.addAttribute("totalUsuarios", usuarioRepository.count());
        model.addAttribute("totalPalpites", palpiteRepository.count());
        model.addAttribute("usuariosAtivos", usuarioRepository.countByUltimoAcessoAfter(ultimas24h));

        long agendadas = partidaRepository.countByStatus(StatusPartida.AGENDADA);
        long emAndamento = partidaRepository.countByStatus(StatusPartida.EM_ANDAMENTO);
        long encerradas = partidaRepository.countByStatus(StatusPartida.ENCERRADA);

        model.addAttribute("partidasPendentes", (agendadas + emAndamento));

        // --- VARIÁVEIS DO GRÁFICO (Se faltar isso, o gráfico fica zerado) ---
        model.addAttribute("partidasAgendadas", agendadas);
        model.addAttribute("partidasEmAndamento", emAndamento);
        model.addAttribute("partidasEncerradas", encerradas);

        // --- OPCIONAIS ---
        model.addAttribute("usuariosBloqueados", usuarioRepository.countByBloqueadoTrue());
        model.addAttribute("selecoesVivas", selecaoRepository.count());

        // Cálculo Seguro da Média de Gols
        List<Partida> partidasEncerradasLista = partidaRepository.findByStatus(StatusPartida.ENCERRADA);
        double media = 0.0;

        if (partidasEncerradasLista != null && !partidasEncerradasLista.isEmpty()) {
            double totalGols = 0.0;
            for (Partida p : partidasEncerradasLista) {
                int golsMandante = p.getGolsMandante() != null ? p.getGolsMandante() : 0;
                int golsVisitante = p.getGolsVisitante() != null ? p.getGolsVisitante() : 0;
                totalGols += (golsMandante + golsVisitante);
            }
            media = totalGols / partidasEncerradasLista.size();
        }

        model.addAttribute("mediaGols", String.format("%.1f", media).replace(",", "."));

        return "dashboard";
    }
}
