package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.repository.SelecaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SelecaoService {

    @Autowired
    private SelecaoRepository repository;

    public Selecao salvar(Selecao selecao) {
        return repository.save(selecao);
    }

    public Selecao listar(Long id) {
        return repository.findById(id).get();
    }

    public List<Selecao> listar() {
        return repository.findAll();
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}