package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("usuarios", service.listar());
        return "usuario/list";
    }

    @GetMapping("/{id}")
    public String listar(@PathVariable Long id, Model model) {
        model.addAttribute("usuario", service.buscarPorId(id));
        return "usuario/form";
    }

    @GetMapping("/novo")
    public String abrirForm(Usuario usuario, Model model) {
        return "usuario/form";
    }

    @PostMapping("/salvar")
    public String salvar(Usuario usuario, Model model) {
        service.salvar(usuario);
        return "redirect:/usuarios";
    }

    @GetMapping("/remover/{id}")
    public String remover(@PathVariable Long id, Model model) {
        service.remover(id);
        return "redirect:/usuarios";
    }

    @GetMapping("/bloquear/{id}")
    public String bloquear(@PathVariable Long id) {
        service.bloquear(id);
        return "redirect:/usuarios";
    }

    @GetMapping("/desbloquear/{id}")
    public String desbloquear(@PathVariable Long id) {
        service.desbloquear(id);
        return "redirect:/usuarios";
    }
}