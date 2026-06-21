package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.model.enums.Grupo;
import hackthon.grupo3.spring.service.SelecaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("selecoes")
public class SelecaoController {

    @Autowired
    private SelecaoService service;

    @GetMapping
    public String listar(
            @RequestParam(required = false) Grupo grupo,
            @RequestParam(required = false, defaultValue = "ASC") String ordem,
            Model model) {

        model.addAttribute("selecoes", service.listarFiltrado(grupo, ordem));

        model.addAttribute("grupos", Grupo.values());

        model.addAttribute("paramGrupo", grupo);
        model.addAttribute("paramOrdem", ordem);

        return "selecao/list";
    }

    @GetMapping("/{id}")
    public String listar(@PathVariable Long id, Model model) {
        model.addAttribute("selecao", service.buscarPorId(id));
        return "selecao/form";
    }

    @GetMapping("/novo")
    public String abrirForm(Selecao selecao, Model model) {
        return "selecao/form";
    }

    @PostMapping("/salvar")
    public String salvar(Selecao selecao, Model model) {
        service.salvar(selecao);
        return "redirect:/selecoes";
    }

    @GetMapping("/remover/{id}")
    public String remover(@PathVariable Long id, Model model) {
        service.remover(id);
        return "redirect:/selecoes";
    }
}
