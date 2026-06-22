package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.model.enums.Fase;
import hackthon.grupo3.spring.model.enums.StatusPartida;
import hackthon.grupo3.spring.service.PartidaService;
import hackthon.grupo3.spring.service.SelecaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("partidas")
public class PartidaController {

    @Autowired
    private PartidaService service;

    @Autowired
    private SelecaoService selecaoService;

    @GetMapping
    public String listar(
            @RequestParam(required = false) Long paisId,
            @RequestParam(required = false) Fase fase,
            @RequestParam(required = false) StatusPartida status,
            Model model) {

        // Agora a pesquisa permite cruzar País + Fase + Status de uma só vez
        List<Partida> partidas = service.filtrarPartidas(paisId, fase, status);

        model.addAttribute("partidas", partidas);
        model.addAttribute("selecoes", selecaoService.listar());
        model.addAttribute("fases", Fase.values());

        model.addAttribute("paramPais", paisId);
        model.addAttribute("paramFase", fase);
        model.addAttribute("paramStatus", status);

        return "partida/list";
    }

    @GetMapping("/{id}")
    public String listar(@PathVariable Long id, Model model) {
        model.addAttribute("partida", service.buscarPorId(id));
        model.addAttribute("selecoes", selecaoService.listar());
        model.addAttribute("fases", Fase.values());
        return "partida/form";
    }

    @GetMapping("/novo")
    public String abrirForm(Partida partida, Model model) {
        partida.setMandante(new Selecao());
        partida.setVisitante(new Selecao());
        model.addAttribute("selecoes", selecaoService.listar());
        model.addAttribute("fases", Fase.values());
        return "partida/form";
    }

    @PostMapping("/salvar")
    public String salvar(Partida partida, Model model) {
        service.salvar(partida);
        return "redirect:/partidas";
    }

    @GetMapping("/remover/{id}")
    public String remover(@PathVariable Long id, Model model) {
        service.remover(id);
        return "redirect:/partidas";
    }
}
