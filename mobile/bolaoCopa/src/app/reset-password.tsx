import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { redefinirSenha } from "../services/loginService";

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { token } = useLocalSearchParams();

    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [secureText, setSecureText] = useState(true);
    const [secureTextConfirm, setSecureTextConfirm] = useState(true);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!token) {
            router.replace("/login");
        }
    }, [token]);

    function trocarEstadoSenha() {
        setSecureText(!secureText);
    }

    function trocarEstadoConfirm() {
        setSecureTextConfirm(!secureTextConfirm);
    }

    async function clicouEmRedefinir() {
        setErrorMessage("");

        if (!senha || !confirmarSenha) {
            setErrorMessage("Preencha todos os campos.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErrorMessage("As senhas não coincidem.");
            return;
        }

        if (senha.length < 6) {
            setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        try {
            setLoading(true);
            await redefinirSenha(String(token).trim(), senha);
            
            Alert.alert(
                "Sucesso",
                "Sua senha foi redefinida com sucesso! Faça login novamente.",
                [{ text: "OK", onPress: () => router.replace("/login") }]
            );
        } catch (error: any) {
            setErrorMessage(error.response?.data?.erro || error.response?.data?.message || "Falha ao redefinir a senha. O token pode estar expirado.");
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return null; // O alert cuidará de voltar
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.topBar}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.replace("/login")}
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                    <Ionicons name="close" size={24} color="#09090B" />
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
                            <Ionicons name="lock-closed-outline" size={64} color="#09090B" style={{ marginBottom: 16 }} />
                            <Text style={styles.brandName}>Nova Senha</Text>
                            <Text style={styles.welcomeText}>Crie uma nova senha para sua conta.</Text>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>Nova Senha</Text>
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

                            <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
                            <View style={[styles.passwordRow, errorMessage ? styles.inputError : null]}>
                                <TextInput 
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    placeholderTextColor="#A1A1AA"
                                    secureTextEntry={secureTextConfirm} 
                                    onChangeText={(text) => {
                                        setConfirmarSenha(text);
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    value={confirmarSenha}
                                />
                                <TouchableOpacity onPress={trocarEstadoConfirm} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                    <Ionicons
                                        name={secureTextConfirm ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={"#71717A"}
                                    />
                                </TouchableOpacity>
                            </View>

                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}

                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={clicouEmRedefinir}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.loginButtonText}>{loading ? 'Salvando...' : 'Salvar Nova Senha'}</Text>
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
        backgroundColor: "#FFFFFF",
    },
    topBar: {
        width: '100%',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    brandName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#09090B',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 15,
        color: '#71717A',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formSection: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#52525B',
        marginBottom: 8,
        marginLeft: 4,
    },
    passwordRow: {
        height: 56,
        backgroundColor: '#F4F4F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#09090B',
        fontWeight: '500',
    },
    loginButton: {
        height: 56,
        backgroundColor: '#09090B',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginTop: 12,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: "#FFFFFF",
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
        textAlign: 'center',
    },
});
