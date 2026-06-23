import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { solicitarRecuperacaoSenha } from "../services/loginService";

export default function EsqueciSenhaScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function clicouEmEnviar() {
        setErrorMessage("");
        setSuccessMessage("");

        if (!email) {
            setErrorMessage("E-mail é obrigatório.");
            return;
        }

        try {
            setLoading(true);
            await solicitarRecuperacaoSenha(email);
            router.push({ pathname: "/verificar-codigo", params: { email } });
        } catch (error: any) {
            setErrorMessage("Falha na conexão com o servidor. Tente novamente mais tarde.");
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
                    onPress={() => router.back()}
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
                            <Ionicons name="key-outline" size={64} color="#09090B" style={{ marginBottom: 16 }} />
                            <Text style={styles.brandName}>Recuperar Senha</Text>
                            <Text style={styles.welcomeText}>Enviaremos as instruções para você redefinir sua senha.</Text>
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
                                    if (successMessage) setSuccessMessage("");
                                }}
                                value={email}
                            />

                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}


                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={clicouEmEnviar}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.loginButtonText}>{loading ? 'Enviando...' : 'Enviar Instruções'}</Text>
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
    input: {
        height: 56,
        backgroundColor: '#F4F4F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#09090B',
        fontWeight: '500',
        borderWidth: 1,
        borderColor: '#E4E4E7',
        marginBottom: 20,
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
