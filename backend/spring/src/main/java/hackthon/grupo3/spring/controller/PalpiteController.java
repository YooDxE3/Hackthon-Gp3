package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.service.PalpiteService;
import hackthon.grupo3.spring.service.PartidaService;
import hackthon.grupo3.spring.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("palpites")
public class PalpiteController {

    @Autowired
    private PalpiteService palpiteService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PartidaService partidaService;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("palpites", palpiteService.listar());
        return "palpite/list";
    }

    @GetMapping("/{id}")
    public String listar(@PathVariable Long id, Model model) {
        model.addAttribute("palpite", palpiteService.buscarPorId(id));
        model.addAttribute("usuarios", usuarioService.listar());
        model.addAttribute("partidas", partidaService.listar());
        return "palpite/form";
    }

    @GetMapping("/novo")
    public String abrirForm(Palpite palpite, Model model) {
        model.addAttribute("usuarios", usuarioService.listar());
        model.addAttribute("partidas", partidaService.listar());
        return "palpite/form";
    }

    @PostMapping("/salvar")
    public String salvar(Palpite palpite, Model model) {
        palpiteService.salvar(palpite);
        return "redirect:/palpites";
    }

    @GetMapping("/remover/{id}")
    public String remover(@PathVariable Long id, Model model) {
        palpiteService.remover(id);
        return "redirect:/palpites";
    }

    @GetMapping("/usuario/{usuarioId}")
    public String listarPorUsuario(@PathVariable Long usuarioId, Model model) {
        model.addAttribute("palpites", palpiteService.listarPorUsuario(usuarioId));
        return "palpite/list";
    }
}
