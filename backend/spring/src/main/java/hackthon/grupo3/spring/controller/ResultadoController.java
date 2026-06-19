package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.service.PartidaService;
import hackthon.grupo3.spring.service.PontuacaoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("partidas")
public class ResultadoController {

    private final PartidaService partidaService;
    private final PontuacaoService pontuacaoService;

    public ResultadoController(PartidaService partidaService, PontuacaoService pontuacaoService) {
        this.partidaService = partidaService;
        this.pontuacaoService = pontuacaoService;
    }

    @GetMapping("/{id}/resultado")
    public String abrirForm(@PathVariable Long id, Model model) {
        model.addAttribute("partida", partidaService.listar(id));
        return "partida/resultado";
    }

    @PostMapping("/{id}/resultado")
    public String lancar(@PathVariable Long id,
                         @RequestParam Integer golsMandante,
                         @RequestParam Integer golsVisitante) {
        pontuacaoService.lancarResultado(id, golsMandante, golsVisitante);
        return "redirect:/partidas";
    }
}
