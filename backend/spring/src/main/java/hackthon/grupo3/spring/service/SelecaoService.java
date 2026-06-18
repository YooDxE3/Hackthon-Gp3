package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.repository.SelecaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SelecaoService {

    private final SelecaoRepository repository;

    public SelecaoService(SelecaoRepository repository) {
        this.repository = repository;
    }

    public List<Selecao> listar() {
        return repository.findAll();
    }

    public Selecao buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seleção não encontrada"));
    }

    public Selecao salvar(Selecao selecao) {
        return repository.save(selecao);
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}