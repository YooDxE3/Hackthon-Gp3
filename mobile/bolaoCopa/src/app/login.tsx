import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { logar } from "../services/loginService";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [secureText, setSecureText] = useState(true);

    function trocarEstadoSenha() {
        setSecureText(!secureText);
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
            const token = await logar(email, senha);

            if (!token) {
                Alert.alert("Atenção!", "Falha ao realizar login, tente novamente.");
                return;
            }
            router.replace("/(tabs)");
        } catch (error) {
            Alert.alert("Erro", "Falha na conexão com a API.");
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <Ionicons 
                    name="football-outline" 
                    size={64} 
                    color={"#007AFF"}
                    style={styles.logo} 
                />
                <Text style={styles.title}>Acesse o Bolão da Copa</Text>

                <Text style={styles.label}>E-mail</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                    <TextInput 
                        style={styles.passwordInput}
                        placeholder="*********"
                        secureTextEntry={secureText} 
                        onChangeText={setSenha}
                    />
                    <TouchableOpacity 
                        onPress={trocarEstadoSenha}
                        style={styles.iconContainer}
                    >
                        <Ionicons
                            name={secureText ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={"#8e8e93"}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={clicouEmlogar}
                >
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#e5e5ea', marginTop: 15 }]}
                    onPress={() => router.push("/register")}
                >
                    <Text style={[styles.buttonText, { color: '#1c1c1e' }]}>Criar Conta</Text>
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
    logo: {
        marginBottom: 10
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
    passwordContainer: {
        flexDirection: "row",
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#e5e5ea",
        borderRadius: 12,
        backgroundColor: "#fbfbfd",
        marginBottom: 10,
        overflow: "hidden"
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#1c1c1e"
    },
    iconContainer: {
        justifyContent: "center",
        paddingHorizontal: 15
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
