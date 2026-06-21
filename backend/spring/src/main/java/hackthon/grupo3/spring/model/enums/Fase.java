package hackthon.grupo3.spring.model.enums;

public enum Fase {
    GRUPOS("Fase de Grupos"),
    OITAVAS("Oitavas de Final"),
    QUARTAS("Quartas de Final"),
    SEMI("Semifinal"),
    FINAL("Final");

    private final String descricao;

    Fase(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}