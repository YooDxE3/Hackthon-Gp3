import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard, Image, StatusBar } from "react-native";
import { logar } from "../services/loginService";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage(""); // Limpa o erro anterior

        if (!email) {
            setErrorMessage("E-mail é obrigatório.");
            return;
        }

        if (!senha) {
            setErrorMessage("Senha é obrigatória.");
            return;
        } 

        try {
            setLoading(true);
            const token = await logar(email, senha);

            if (!token) {
                setErrorMessage("Falha ao realizar login, tente novamente.");
                return;
            }
            router.replace("/(tabs)");
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setErrorMessage("E-mail ou Senha incorretos.");
            } else {
                setErrorMessage("Falha na conexão com o servidor.");

            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.topBar}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace("/(tabs)");
                        }
                    }}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                    <Ionicons name="arrow-back" size={24} color="#09090B" />
                </TouchableOpacity>
            </View>

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
                        <View style={styles.headerContainer}>
                            <Image 
                                source={require('../../assets/images/copa-2026-logo.png')} 
                                style={styles.logoImage} 
                                resizeMode="contain"
                            />
                            <Text style={styles.welcomeText}>Bem-vindo ao</Text>
                            <Text style={styles.brandName}>Bolão da Copa</Text>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>E-mail</Text>
                            <TextInput 
                                style={[styles.input, errorMessage ? styles.inputError : null]}
                                placeholder="seu@email.com"
                                placeholderTextColor="#A1A1AA"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errorMessage) setErrorMessage("");
                                }}
                                value={email}
                            />

                            <Text style={styles.inputLabel}>Senha</Text>
                            <View style={[styles.passwordRow, errorMessage ? styles.inputError : null]}>
                                <TextInput 
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    placeholderTextColor="#A1A1AA"
                                    secureTextEntry={secureText} 
                                    onChangeText={(text) => {
                                        setSenha(text);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    value={senha}
                                />
                                <TouchableOpacity onPress={trocarEstadoSenha} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                    <Ionicons
                                        name={secureText ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={"#71717A"}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.forgotRow} onPress={esqueciMinhaSenha}>
                                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>

                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}

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
        backgroundColor: "#FFFFFF", // Pure white background
    },
    topBar: {
        width: '100%',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F4F4F5',
        justifyContent: 'center',
        alignItems: 'center',
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
    headerContainer: {
        marginBottom: 48,
        alignItems: 'center',
    },
    logoImage: {
        width: 140,
        height: 180,
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 14,
        color: '#71717A', // Zinc 500
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    brandName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#09090B', // Zinc 950
        letterSpacing: -0.5,
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
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#09090B',
        fontWeight: '500',
    },
    forgotRow: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotText: {
        color: '#52525B', // Zinc 600
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
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
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: "#FFFFFF",
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E4E4E7', // Zinc 200
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 13,
        color: '#A1A1AA', // Zinc 400
        fontWeight: '500',
    },
    registerButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7', // Zinc 200
        backgroundColor: '#FFFFFF',
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#09090B',
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
