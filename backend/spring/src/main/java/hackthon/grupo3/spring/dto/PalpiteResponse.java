package hackthon.grupo3.spring.dto;

import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.model.enums.CriterioPontuacao;
import hackthon.grupo3.spring.model.enums.StatusPartida;

public record PalpiteResponse(
        Long id,
        Long partidaId,
        String confronto,
        Integer golsMandante,
        Integer golsVisitante,
        Integer pontosObtidos,
        CriterioPontuacao criterioAplicado,
        StatusPartida statusPartida
) {
    public static PalpiteResponse de(Palpite p) {
        return new PalpiteResponse(
                p.getId(),
                p.getPartida().getId(),
                p.getPartida().getMandante().getNome() + " x " + p.getPartida().getVisitante().getNome(),
                p.getGolsMandante(),
                p.getGolsVisitante(),
                p.getPontosObtidos(),
                p.getCriterioAplicado(),
                p.getPartida().getStatus()
        );
    }
}
