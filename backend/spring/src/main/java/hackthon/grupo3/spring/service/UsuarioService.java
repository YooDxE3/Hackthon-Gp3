package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<Usuario> listar() {
        return repository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario salvar(Usuario usuario) {
        return repository.save(usuario);
    }

    public Usuario bloquear(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setBloqueado(true);
        return repository.save(usuario);
    }

    public Usuario desbloquear(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setBloqueado(false);
        return repository.save(usuario);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
