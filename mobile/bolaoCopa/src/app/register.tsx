import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image, StatusBar } from 'react-native';
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
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();

  const handleRegister = async () => {
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Preencha todos os campos!');
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
        setErrorMessage('Não foi possível cadastrar.');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.response?.data?.erro || 'Falha ao realizar cadastro no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
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
                        <Ionicons name="arrow-back" size={22} color="#09090B" />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Image 
                            source={require('../../assets/images/copa-2026-logo.png')} 
                            style={styles.logoImage} 
                            resizeMode="contain"
                        />
                        <Text style={styles.pageTitle}>Criar conta</Text>
                        <Text style={styles.pageSubtitle}>Junte-se ao bolão e dispute com seus amigos</Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Nome</Text>
                        <TextInput
                            style={[styles.input, errorMessage ? styles.inputError : null]}
                            placeholder="Como quer ser chamado"
                            placeholderTextColor="#A1A1AA"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errorMessage) setErrorMessage('');
                            }}
                        />

                        <Text style={styles.inputLabel}>E-mail</Text>
                        <TextInput
                            style={[styles.input, errorMessage ? styles.inputError : null]}
                            placeholder="seu@email.com"
                            placeholderTextColor="#A1A1AA"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errorMessage) setErrorMessage('');
                            }}
                        />
                        
                        <Text style={styles.inputLabel}>Senha</Text>
                        <View style={[styles.passwordRow, errorMessage ? styles.inputError : null]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor="#A1A1AA"
                                secureTextEntry={secureText}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errorMessage) setErrorMessage('');
                                }}
                            />
                            <TouchableOpacity onPress={() => setSecureText(!secureText)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Ionicons
                                    name={secureText ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={"#71717A"}
                                />
                            </TouchableOpacity>
                        </View>

                        {errorMessage ? (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        ) : null}

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
        backgroundColor: "#FFFFFF", // Pure white background
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
        backgroundColor: '#F4F4F5', // Zinc 100
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7', // Zinc 200
        marginBottom: 32,
    },
    headerContainer: {
        marginBottom: 36,
        alignItems: 'center',
    },
    logoImage: {
        width: 100,
        height: 120,
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#09090B', // Zinc 950
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#71717A', // Zinc 500
        fontWeight: '400',
        lineHeight: 22,
        textAlign: 'center',
    },
    formSection: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#52525B', // Zinc 600
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        backgroundColor: '#F4F4F5', // Zinc 100
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#09090B',
        fontWeight: '500',
        borderWidth: 1,
        borderColor: '#E4E4E7', // Zinc 200
        marginBottom: 20,
    },
    passwordRow: {
        height: 56,
        backgroundColor: '#F4F4F5', // Zinc 100
        borderRadius: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7', // Zinc 200
        marginBottom: 28,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#09090B',
        fontWeight: '500',
    },
    submitButton: {
        height: 56,
        backgroundColor: '#09090B', // Zinc 950
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    submitButtonDisabled: {
        opacity: 0.7,
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
        color: '#71717A', // Zinc 500
    },
    footerLink: {
        fontSize: 15,
        fontWeight: '600',
        color: '#09090B', // Zinc 950
    },
    inputError: {
        borderColor: '#EF4444', // Red 500
        backgroundColor: '#FEF2F2', // Light red background
    },
    errorText: {
        color: '#EF4444', // Red 500
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 24,
        textAlign: 'center',
    },
});
