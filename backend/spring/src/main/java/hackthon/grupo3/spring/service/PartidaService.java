package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.repository.PartidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartidaService {

    @Autowired
    private PartidaRepository repository;

    public Partida salvar(Partida partida) {
        return repository.save(partida);
    }

    public Partida listar(Long id) {
        return repository.findById(id).get();
    }

    public List<Partida> listar() {
        return repository.findAllByOrderByDataHoraAsc();
    }

    public void remover(Long id) {
        repository.deleteById(id);
    }
}
