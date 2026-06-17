package hackthon.grupo3.spring.dto;

public record PalpiteRequest(
        Long partidaId,
        Integer golsMandante,
        Integer golsVisitante
) {
}
