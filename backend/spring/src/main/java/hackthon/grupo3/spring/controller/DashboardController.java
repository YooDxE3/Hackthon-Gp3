package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.enums.StatusPartida;
import hackthon.grupo3.spring.repository.PartidaRepository;
import hackthon.grupo3.spring.repository.SelecaoRepository;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;

@Controller
public class DashboardController {

        private final UsuarioRepository usuarioRepository;
        private final PartidaRepository partidaRepository;
        private  final SelecaoRepository selecaoRepository;

        public DashboardController(UsuarioRepository usuarioRepository , PartidaRepository partidaRepository, SelecaoRepository selecaoRepository){
            this.usuarioRepository = usuarioRepository;
            this.partidaRepository = partidaRepository;
            this.selecaoRepository = selecaoRepository;
        }

        @GetMapping({"/", "/dashboard"})
        public String dashboard(Model model){
            LocalDateTime ultimas24h = LocalDateTime.now().minusHours(24);

            model.addAttribute("usuariosAtivos", usuarioRepository.countByUltimoAcessoAfter(ultimas24h));
            model.addAttribute("totalUsuarios", usuarioRepository.count());
            model.addAttribute("partidasEncerradas", partidaRepository.countByStatus(StatusPartida.ENCERRADA));
            model.addAttribute("totalSelecoes", selecaoRepository.count());

            return "dashboard";
        }
}
