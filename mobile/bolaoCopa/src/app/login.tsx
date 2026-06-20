import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { logar } from "../services/loginService";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);

    function trocarEstadoSenha() {
        setSecureText(!secureText);
    }

    function esqueciMinhaSenha() {
        Alert.alert(
            "Recuperação de Senha", 
            "Funcionalidade não implementada no servidor ainda. Solicite ao administrador a redefinição de senha."
        );
    }

    async function clicouEmlogar() {
        if (!email) {
            Alert.alert("Atenção!", "Email é obrigatório.");
            return;
        }

        if (!senha) {
            Alert.alert("Atenção!", "Senha é obrigatória.");
            return;
        } 

        try {
            setLoading(true);
            const token = await logar(email, senha);

            if (!token) {
                Alert.alert("Atenção!", "Falha ao realizar login, tente novamente.");
                return;
            }
            router.replace("/(tabs)");
        } catch (error) {
            Alert.alert("Erro", "Falha na conexão com a API.");
        } finally {
            setLoading(false);
        }
    }

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
                        {/* Decorative accent bar */}
                        <View style={styles.accentBar} />

                        <View style={styles.headerContainer}>
                            <Text style={styles.welcomeText}>Bem-vindo ao</Text>
                            <Text style={styles.brandName}>Bolão da Copa</Text>
                            <Text style={styles.year}>2026</Text>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>E-mail</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="seu@email.com"
                                placeholderTextColor="#B8C4CE"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={setEmail}
                                value={email}
                            />

                            <Text style={styles.inputLabel}>Senha</Text>
                            <View style={styles.passwordRow}>
                                <TextInput 
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    placeholderTextColor="#B8C4CE"
                                    secureTextEntry={secureText} 
                                    onChangeText={setSenha}
                                    value={senha}
                                />
                                <TouchableOpacity onPress={trocarEstadoSenha} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                    <Ionicons
                                        name={secureText ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={"#8896A6"}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.forgotRow} onPress={esqueciMinhaSenha}>
                                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={clicouEmlogar}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.loginButtonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => router.push("/register")}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.registerButtonText}>Criar uma conta</Text>
                        </TouchableOpacity>
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
        justifyContent: 'center',
        paddingBottom: 40,
    },
    accentBar: {
        width: 48,
        height: 5,
        backgroundColor: '#1B7A4E',
        borderRadius: 3,
        marginBottom: 32,
    },
    headerContainer: {
        marginBottom: 48,
    },
    welcomeText: {
        fontSize: 16,
        color: '#6B7D8E',
        fontWeight: '500',
        marginBottom: 6,
    },
    brandName: {
        fontSize: 36,
        fontWeight: '700',
        color: '#1A2B3C',
        lineHeight: 40,
    },
    year: {
        fontSize: 56,
        fontWeight: '800',
        color: '#1B7A4E',
        lineHeight: 60,
        marginTop: -4,
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
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#1A2B3C',
        fontWeight: '500',
    },
    forgotRow: {
        alignItems: 'flex-end',
        marginBottom: 28,
    },
    forgotText: {
        color: '#1B7A4E',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        height: 54,
        backgroundColor: '#1B7A4E',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: "#FFFFFF",
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E8EB',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 13,
        color: '#8896A6',
        fontWeight: '500',
    },
    registerButton: {
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#D1D9E0',
        backgroundColor: '#FFFFFF',
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2B3C',
    },
});
