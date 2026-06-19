import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    try {
      setLoading(true);
      
      const resposta = await api.post('/auth/registro', { 
        nome: name, 
        email: email, 
        senha: password 
      });

      if (resposta.status === 200) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Atenção', 'Não foi possível cadastrar.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao realizar cadastro na API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Criar Conta</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#e5e5ea', marginTop: 15 }]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: '#1c1c1e' }]}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    innerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1c1c1e",
        marginBottom: 30 
    },
    label: {
        alignSelf: "flex-start",
        fontSize: 14,
        fontWeight: '600',
        color: '#8e8e93',
        marginBottom: 5,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#e5e5ea",
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#1c1c1e",
        backgroundColor: "#fbfbfd",
        marginBottom: 15
    },
    button: {
        width: "100%",
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: "#007AFF"
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "#FFF"
    }
});
