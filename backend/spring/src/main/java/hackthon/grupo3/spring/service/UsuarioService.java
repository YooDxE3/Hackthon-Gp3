package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));
    }

    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado no sistema.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // Método usado pelo UsuarioController (Painel Web Thymeleaf)
    public void alternarBloqueio(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setBloqueado(!usuario.getBloqueado());
        usuarioRepository.save(usuario);
    }

    // Método usado pelo UsuarioApi (Mobile REST)
    public Usuario bloquear(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setBloqueado(true);
        return usuarioRepository.save(usuario);
    }

    // Método usado pelo UsuarioApi (Mobile REST)
    public Usuario desbloquear(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setBloqueado(false);
        return usuarioRepository.save(usuario);
    }

    // Método usado pelo UsuarioApi (Mobile REST)
    public void remover(Long id) {
        usuarioRepository.deleteById(id);
    }
}