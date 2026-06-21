import { api } from './api';

export interface Selecao {
  id: number;
  nome: string;
  codigoFifa: string;
  escudoUrl: string;
  grupo: string;
}

export interface Partida {
  id: number;
  mandante: Selecao;
  visitante: Selecao;
  dataHora: string;
  estadio: string;
  fase: string;
  grupo: string;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA';
  golsMandante: number | null;
  golsVisitante: number | null;
}

export const buscarPartidas = async (): Promise<Partida[]> => {
  const response = await api.get('/partidas');
  return response.data;
};

export const buscarPartidaPorId = async (id: number): Promise<Partida> => {
  const response = await api.get(`/partidas/${id}`);
  return response.data;
};
