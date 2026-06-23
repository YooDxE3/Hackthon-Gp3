import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../services/api";

export default function VerificarCodigoScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    
    const [codigo, setCodigo] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function clicouEmValidar() {
        setErrorMessage("");

        if (!codigo || codigo.length < 6) {
            setErrorMessage("Digite o código de 6 dígitos.");
            return;
        }

        try {
            setLoading(true);
            const codigoLimpo = codigo.replace(/\s/g, '').trim();
            await api.post("/auth/verificar-codigo", { token: codigoLimpo });
            // Código válido, redireciona para a tela de reset passando o código como token
            router.push({ pathname: "/reset-password", params: { token: codigoLimpo } });
        } catch (error: any) {
            setErrorMessage("Erro: " + (error.response ? JSON.stringify(error.response.data) : error.message));
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
                            <Ionicons name="mail-unread-outline" size={64} color="#09090B" style={{ marginBottom: 16 }} />
                            <Text style={styles.brandName}>Verifique seu E-mail</Text>
                            <Text style={styles.welcomeText}>
                                Digite o código de 6 dígitos que enviamos para <Text style={{fontWeight: '700'}}>{email || 'seu e-mail'}</Text>.
                            </Text>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>Código de Recuperação</Text>
                            <TextInput 
                                style={[styles.input, errorMessage ? styles.inputError : null]}
                                placeholder="000000"
                                placeholderTextColor="#A1A1AA"
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                                onChangeText={(text) => {
                                    setCodigo(text);
                                    if (errorMessage) setErrorMessage("");
                                }}
                                value={codigo}
                            />

                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}

                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={clicouEmValidar}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.loginButtonText}>{loading ? 'Validando...' : 'Verificar Código'}</Text>
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
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 15,
        color: '#71717A',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 22,
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
        textAlign: 'center',
    },
    input: {
        height: 64,
        backgroundColor: '#F4F4F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 28,
        letterSpacing: 8,
        color: '#09090B',
        fontWeight: '800',
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
