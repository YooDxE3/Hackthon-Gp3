import { api } from './api';

export interface UsuarioRanking {
  id: number;
  nome: string;
  avatarUrl: string | null;
  pontuacaoTotal: number;
  placaresExatos: number;
}

export const buscarRanking = async (): Promise<UsuarioRanking[]> => {
  try {
    const response = await api.get('/ranking');
    return response.data;
  } catch (error: any) {
    console.log("ERRO REAL DA API RANKING:", error.response?.data || error.message);
    throw error;
  }
};
