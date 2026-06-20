import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { logout } from '@/services/loginService';
import { api } from '@/services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [nome, setNome] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('user_email');
      if (!email) {
        Alert.alert('Erro', 'Não foi possível identificar o usuário logado.');
        setLoading(false);
        return;
      }

      const response = await api.get('/usuarios');
      const usuarios = response.data;
      const loggedUser = usuarios.find((u: any) => u.email === email);

      if (loggedUser) {
        setUser(loggedUser);
        setNome(loggedUser.nome || '');
        setAvatarUrl(loggedUser.avatarUrl || '');
      } else {
        Alert.alert('Erro', 'Usuário não encontrado na base de dados.');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Aviso', 'O nome não pode ficar vazio.');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = {
        ...user,
        nome: nome,
        avatarUrl: avatarUrl
      };

      await api.put(`/usuarios/${user.id}`, updatedUser);
      setUser(updatedUser);
      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair do Bolão da Copa?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => {
            await logout();
            router.replace('/login');
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Excluir Conta', 'Tem certeza absoluta? Esta ação não pode ser desfeita e todos os seus palpites serão perdidos.', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Excluir', 
        style: 'destructive', 
        onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/usuarios/${user.id}`);
              await logout();
              Alert.alert('Sucesso', 'Sua conta foi excluída.');
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao excluir conta:', error);
              Alert.alert('Erro', 'Não foi possível excluir sua conta.');
              setLoading(false);
            }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B7A4E" />
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

            {/* Profile card */}
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

            {/* Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Informações</Text>
              
              <Text style={styles.inputLabel}>Nome de exibição</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor="#B8C4CE"
              />

              <Text style={styles.inputLabel}>URL do avatar</Text>
              <TextInput
                style={styles.input}
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="https://link-da-foto.jpg"
                placeholderTextColor="#B8C4CE"
                autoCapitalize="none"
              />

              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar alterações</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
                <View style={styles.actionLeft}>
                  <Ionicons name="log-out-outline" size={20} color="#4A5B6C" />
                  <Text style={styles.actionText}>Sair da conta</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C8CDD2" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionRow, styles.actionRowDanger]} onPress={handleDeleteAccount}>
                <View style={styles.actionLeft}>
                  <Ionicons name="trash-outline" size={20} color="#DC4C4C" />
                  <Text style={styles.actionTextDanger}>Excluir conta</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EAB0B0" />
              </TouchableOpacity>
            </View>

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
    backgroundColor: '#FAFAF8',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
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
    color: '#1A2B3C',
  },
  // Profile card
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F0F2F4',
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
    backgroundColor: '#1B7A4E',
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
    color: '#1A2B3C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7D8E',
    marginBottom: 14,
  },
  rolePill: {
    backgroundColor: '#EBF5F0',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleText: {
    color: '#1B7A4E',
    fontWeight: '600',
    fontSize: 13,
  },
  // Form
  formSection: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B3C',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  saveButton: {
    height: 54,
    backgroundColor: '#1B7A4E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Actions
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F2F4',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
  },
  actionRowDanger: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A2B3C',
    marginLeft: 12,
  },
  actionTextDanger: {
    fontSize: 15,
    fontWeight: '500',
    color: '#DC4C4C',
    marginLeft: 12,
  },
});
