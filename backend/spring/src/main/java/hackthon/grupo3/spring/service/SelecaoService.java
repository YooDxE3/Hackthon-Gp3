package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.model.enums.Grupo;
import hackthon.grupo3.spring.repository.SelecaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SelecaoService {
    @Autowired
    private final SelecaoRepository repository;

    public SelecaoService(SelecaoRepository repository) {
        this.repository = repository;
    }

    public List<Selecao> listar() {
        return repository.findAll();
    }

    public List<Selecao> listarFiltrado(Grupo grupo, String ordem) {
        Sort.Direction direcao = "DESC".equalsIgnoreCase(ordem) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Sort sort = Sort.by(direcao, "grupo").and(Sort.by(Sort.Direction.ASC, "nome"));

        return repository.filtrarPorGrupo(grupo, sort);
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