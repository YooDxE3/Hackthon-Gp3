import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PalpiteRequest {
  partidaId: number;
  golsMandante: number;
  golsVisitante: number;
}

export const salvarPalpite = async (palpite: PalpiteRequest): Promise<any> => {
  
  const token = await AsyncStorage.getItem('jwt_token');
  
  const response = await api.post('/palpites', palpite, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

export const buscarMeusPalpites = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    const response = await api.get('/palpites/meus', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.log("ERRO REAL DA API PALPITES:", error.response?.data || error.message);
    throw error;
  }
};
