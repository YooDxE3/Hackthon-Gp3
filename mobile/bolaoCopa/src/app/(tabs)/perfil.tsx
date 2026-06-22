import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { sairDaConta } from '@/services/loginService';
import { api } from '@/services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TelaPerfil() {
  const router = useRouter();
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [user, setUsuario] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      const email = await AsyncStorage.getItem('user_email');
      const token = await AsyncStorage.getItem('jwt_token');

      if (!token || !email) {
        setIsGuest(true);
        setCarregando(false);
        return;
      }
      setIsGuest(false);

      const response = await api.get('/usuarios');
      const usuarios = response.data;
      const loggedUser = usuarios.find((u: any) => u.email === email);

      if (loggedUser) {
        setUsuario(loggedUser);
        setNome(loggedUser.nome || '');
        setAvatarUrl(loggedUser.avatarUrl || '');
      } else {
        Alert.alert('Erro', 'Usuário não encontrado na base de dados.');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setCarregando(false);
    }
  };

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      Alert.alert('Aviso', 'O nome não pode ficar vazio.');
      return;
    }

    try {
      setSalvando(true);
      const updatedUser = {
        ...user,
        nome: nome,
        avatarUrl: avatarUrl
      };

      if (senha.trim() !== '') {
        updatedUser.senha = senha;
      }

      await api.put(`/usuarios/${user.id}`, updatedUser);
      setUsuario(updatedUser);
      
      if (senha.trim() !== '') {
        Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
        setSenha('');
        setEditando(false);
      } else {
        Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
        setEditando(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarSaida = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair do Bolão da Copa?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => {
            await sairDaConta();
            router.replace('/login');
        }
      }
    ]);
  };

  const excluirConta = () => {
    Alert.alert('Excluir Conta', 'Tem certeza absoluta? Esta ação não pode ser desfeita e todos os seus palpites serão perdidos.', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Excluir', 
        style: 'destructive', 
        onPress: async () => {
            try {
              setCarregando(true);
              await api.delete(`/usuarios/${user.id}`);
              await sairDaConta();
              Alert.alert('Sucesso', 'Sua conta foi excluída.');
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao excluir conta:', error);
              Alert.alert('Erro', 'Não foi possível excluir sua conta.');
              setCarregando(false);
            }
        }
      }
    ]);
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B7A4E" />
      </SafeAreaView>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]} edges={['top']}>
        <View style={{ alignItems: 'center', padding: 40 }}>
          <Ionicons name="person-circle-outline" size={80} color="#D1D9E0" />
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#09090B', marginTop: 16 }}>Perfil</Text>
          <Text style={{ fontSize: 15, color: '#71717A', textAlign: 'center', marginTop: 8, marginBottom: 32 }}>
            Você está navegando como visitante. Crie uma conta ou faça login para participar do bolão e competir com seus amigos!
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#09090B', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 }} 
            onPress={() => router.push('/login')}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Fazer Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ backgroundColor: '#F4F4F5', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }} 
            onPress={() => router.push('/register')}
          >
            <Text style={{ color: '#09090B', fontWeight: '600', fontSize: 16 }}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.pageTitle}>Perfil</Text>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarSection}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>{user?.nome?.charAt(0)?.toUpperCase() || '?'}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userName}>{user?.nome}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{user?.perfil === 'ADMIN' ? 'Administrador' : 'Jogador'}</Text>
              </View>
            </View>

            {editando ? (
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Editar Perfil</Text>
                
                <Text style={styles.inputLabel}>Nome de exibição</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome"
                  placeholderTextColor="#B8C4CE"
                />

                <Text style={styles.inputLabel}>URL da Foto (Avatar)</Text>
                <TextInput
                  style={styles.input}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="https://link-da-foto.jpg"
                  placeholderTextColor="#B8C4CE"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>E-mail <Ionicons name="lock-closed" size={12} color="#8A9BA8" /></Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={user?.email}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Nova Senha</Text>
                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Deixe em branco para não alterar"
                  placeholderTextColor="#B8C4CE"
                  secureTextEntry
                />

                <TouchableOpacity 
                  style={[styles.saveButton, salvando && styles.saveButtonDisabled]} 
                  onPress={salvarPerfil}
                  disabled={salvando}
                  activeOpacity={0.85}
                >
                  {salvando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar alterações</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setEditando(false);
                    setNome(user?.nome || '');
                    setAvatarUrl(user?.avatarUrl || '');
                    setSenha('');
                  }}
                  disabled={salvando}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.actionRow} onPress={() => setEditando(true)}>
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#F4F4F5' }]}>
                      <Ionicons name="pencil" size={20} color="#09090B" />
                    </View>
                    <Text style={[styles.actionText, { color: '#09090B' }]}>Editar Perfil</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C8CDD2" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={confirmarSaida}>
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#F0F2F4' }]}>
                      <Ionicons name="log-out-outline" size={20} color="#4A5B6C" />
                    </View>
                    <Text style={styles.actionText}>Sair da conta</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C8CDD2" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionRow, styles.actionRowDanger]} onPress={excluirConta}>
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#FDEDED' }]}>
                      <Ionicons name="trash-outline" size={20} color="#DC4C4C" />
                    </View>
                    <Text style={styles.actionTextDanger}>Excluir conta</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#EAB0B0" />
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#09090B',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 28,
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  avatarSection: {
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#09090B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#09090B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#71717A',
    marginBottom: 14,
  },
  rolePill: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleText: {
    color: '#09090B',
    fontWeight: '600',
    fontSize: 13,
  },
  formSection: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#09090B',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525B',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    height: 52,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#09090B',
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
    marginBottom: 16,
  },
  inputDisabled: {
    backgroundColor: '#F4F4F5',
    color: '#A1A1AA',
    borderColor: '#E4E4E7',
  },
  saveButton: {
    height: 54,
    backgroundColor: '#09090B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#71717A',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  actionRowDanger: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#09090B',
    marginLeft: 14,
  },
  actionTextDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC4C4C',
    marginLeft: 14,
  },
});
