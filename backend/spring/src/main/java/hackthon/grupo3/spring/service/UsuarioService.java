package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> obterRanking() {
        return usuarioRepository.findAllByOrderByPontuacaoTotalDescPlacaresExatosDesc();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario salvar(Usuario usuario) {
        if (usuario.getId() == null) {
            if (usuarioRepository.existsByEmail(usuario.getEmail())) {
                throw new IllegalArgumentException("E-mail já cadastrado no sistema.");
            }
            usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        } else {
            Usuario existente = buscarPorId(usuario.getId());
            if (usuario.getSenha() == null || usuario.getSenha().trim().isEmpty()) {
                usuario.setSenha(existente.getSenha());
            } else if (!usuario.getSenha().startsWith("$2a$")) {
                usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
            }
        }
        return usuarioRepository.save(usuario);
    }

    public void atualizarPerfilLogado(String emailOriginal, String novoNome, String novaFoto, String novaSenha) {
        Usuario usuario = usuarioRepository.findByEmail(emailOriginal)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));
        usuario.setNome(novoNome);
        usuario.setAvatarUrl(novaFoto);

        if (novaSenha != null && !novaSenha.trim().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(novaSenha));
        }
        usuarioRepository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario bloquear(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        usuario.setBloqueado(true);
        return usuarioRepository.save(usuario);
    }

    public Usuario desbloquear(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        usuario.setBloqueado(false);
        return usuarioRepository.save(usuario);
    }

    public void remover(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado.");
        }
        usuarioRepository.deleteById(id);
    }

    public void alternarBloqueio(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setBloqueado(!usuario.getBloqueado());
        usuarioRepository.save(usuario);
    }

    public void registrarAcesso(String email) {
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            usuario.setUltimoAcesso(LocalDateTime.now());
            usuarioRepository.save(usuario);
        });
    }

}
