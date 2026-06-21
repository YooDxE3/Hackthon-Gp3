package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.service.UsuarioService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("usuarios", usuarioService.listarTodos());
        return "usuario/list";
    }

    @PostMapping("/{id}/bloqueio")
    public String alternarBloqueio(@PathVariable Long id) {
        usuarioService.alternarBloqueio(id);
        return "redirect:/usuarios";
    }

    @PreAuthorize("hasHole('ADMIN')")
    @GetMapping("/novo")
    public String abrirFormulario(Model model) {
        model.addAttribute("usuario", new Usuario());
        return "usuario/form";
    }

    @PreAuthorize("hasHole('ADMIN')")
    @PostMapping("/salvar")
    public String salvar(Usuario usuario) {
        usuarioService.salvar(usuario);
        return "redirect:/usuarios";
    }

    @GetMapping("/perfil")
    public String meuPerfil(Principal principal, Model model){
        Usuario usuario = (Usuario) usuarioService.loadUserByUsername(principal.getName());

        usuario.setSenha("");

        model.addAttribute("usuario", usuario);
        return "usuario/perfil";
    }

    @PostMapping("/perfil/salvar")
    public String salvarPerfil(@ModelAttribute Usuario dadosFormulario, Principal principal) {
        try {
            usuarioService.atualizarPerfilLogado(
                    principal.getName(),
                    dadosFormulario.getNome(),
                    dadosFormulario.getAvatarUrl(),
                    dadosFormulario.getSenha()
            );

            return "redirect:/dashboard";

        } catch (Exception e) {
            return "redirect:/usuarios/perfil?error";
        }
    }
}