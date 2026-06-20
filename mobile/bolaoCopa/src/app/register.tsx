import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#1A2B3C" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Criar conta</Text>
                <Text style={styles.pageSubtitle}>Junte-se ao bolão e dispute com seus amigos</Text>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Como quer ser chamado"
                    placeholderTextColor="#B8C4CE"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#B8C4CE"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={styles.passwordRow}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor="#B8C4CE"
                        secureTextEntry={secureText}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setSecureText(!secureText)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Ionicons
                            name={secureText ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={"#8896A6"}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                    onPress={handleRegister} 
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.submitButtonText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.footerLink}>Fazer login</Text>
                </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAF8",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E8EB',
        marginBottom: 32,
    },
    headerContainer: {
        marginBottom: 36,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1A2B3C',
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#6B7D8E',
        fontWeight: '400',
        lineHeight: 22,
    },
    formSection: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4A5B6C',
        marginBottom: 8,
        marginLeft: 2,
    },
    input: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1A2B3C',
        fontWeight: '500',
        borderWidth: 1.5,
        borderColor: '#E5E8EB',
        marginBottom: 20,
    },
    passwordRow: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E8EB',
        marginBottom: 28,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#1A2B3C',
        fontWeight: '500',
    },
    submitButton: {
        height: 54,
        backgroundColor: '#1B7A4E',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: "#FFFFFF",
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 15,
        color: '#6B7D8E',
    },
    footerLink: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1B7A4E',
    },
});
