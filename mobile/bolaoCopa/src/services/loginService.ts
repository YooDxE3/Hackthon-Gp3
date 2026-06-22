import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

type LoginResponse = {
    token: string;
};

export async function logar(email: string, senha: string) {
    try {
        const resposta = await api.post<LoginResponse>("/auth/login", { 
            email: email, 
            senha: senha 
        });

        if (resposta.status === 200 && resposta.data.token) {
            await AsyncStorage.setItem('jwt_token', resposta.data.token);
            await AsyncStorage.setItem('user_email', email);
            return resposta.data.token;
        }

        return null;
    } catch (error) {
        throw error;
    }
}

export async function sairDaConta() {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_email');
}
