import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarPartidaPorId, Partida } from '../../services/partidaService';
import { salvarPalpite, buscarMeusPalpites } from '../../services/palpiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function TelaDetalhePartida() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [partida, setPartida] = useState<Partida | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const [golsMandante, setGolsMandante] = useState('0');
  const [golsVisitante, setGolsVisitante] = useState('0');

  const incrementarGol = (isMandante: boolean) => {
    Vibration.vibrate(10);
    if (isMandante) {
      setGolsMandante(prev => String(Math.min(99, (Number(prev) || 0) + 1)));
    } else {
      setGolsVisitante(prev => String(Math.min(99, (Number(prev) || 0) + 1)));
    }
  };

  const decrementarGol = (isMandante: boolean) => {
    Vibration.vibrate(10);
    if (isMandante) {
      setGolsMandante(prev => String(Math.max(0, (Number(prev) || 0) - 1)));
    } else {
      setGolsVisitante(prev => String(Math.max(0, (Number(prev) || 0) - 1)));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partidaId = Number(id);
        const token = await AsyncStorage.getItem('jwt_token');
        const isUserGuest = !token;
        setIsGuest(isUserGuest);

        const [partidaData, meusPalpitesData] = await Promise.all([
          buscarPartidaPorId(partidaId),
          isUserGuest ? Promise.resolve([]) : buscarMeusPalpites().catch(() => [])
        ]);

        setPartida(partidaData);

        const existingPalpite = meusPalpitesData.find((p: any) => p.partidaId === partidaId);
        if (existingPalpite) {
          setGolsMandante(existingPalpite.golsMandante.toString());
          setGolsVisitante(existingPalpite.golsVisitante.toString());
          setEditando(true);
        }

      } catch (error) {
        console.error('Erro ao buscar dados da partida:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes da partida.');
        router.back();
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const salvarAcaoPalpite = async () => {
    if (!golsMandante || !golsVisitante) {
      Alert.alert('Atenção', 'Preencha o placar para as duas seleções.');
      return;
    }

    try {
      setEnviando(true);
      await salvarPalpite({
        partidaId: Number(id),
        golsMandante: Number(golsMandante),
        golsVisitante: Number(golsVisitante),
      });

      Alert.alert('Sucesso!', 'Seu palpite foi registrado!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Erro ao salvar palpite:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao salvar o palpite.');
    } finally {
      setEnviando(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (carregando || !partida) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09090B" />
      </SafeAreaView>
    );
  }

  const isEncerrada = partida.status === 'ENCERRADA';

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#09090B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 44 }} />
      </View>

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
            <View style={styles.metaSection}>
              <View style={styles.fasePill}>
                <Text style={styles.faseText}>{partida.fase}</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(partida.dataHora)}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#8896A6" />
                <Text style={styles.locationText}>{partida.estadio || 'Estádio a definir'}</Text>
              </View>
            </View>
            <View style={styles.matchCard}>
              <View style={styles.teamCol}>
                <View style={styles.flagContainer}>
                  {partida.mandante?.escudoUrl ? (
                    <Image source={{ uri: partida.mandante.escudoUrl }} style={styles.flagImg} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>🏴</Text>
                  )}
                </View>
                <Text style={styles.teamName} numberOfLines={2}>{partida.mandante?.nome || 'Time A'}</Text>
                
                {!isEncerrada && !isGuest && (
                  <View style={styles.stepperGroup}>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => decrementarGol(true)}>
                      <Ionicons name="remove" size={20} color="#09090B" />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{golsMandante}</Text>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => incrementarGol(true)}>
                      <Ionicons name="add" size={20} color="#09090B" />
                    </TouchableOpacity>
                  </View>
                )}
                {isEncerrada && <Text style={styles.finalScore}>{partida.golsMandante}</Text>}
              </View>

              <View style={styles.vsCol}>
                 <Text style={styles.vsTextLabel}>VS</Text>
              </View>

              <View style={styles.teamCol}>
                <View style={styles.flagContainer}>
                  {partida.visitante?.escudoUrl ? (
                    <Image source={{ uri: partida.visitante.escudoUrl }} style={styles.flagImg} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>🏴</Text>
                  )}
                </View>
                <Text style={styles.teamName} numberOfLines={2}>{partida.visitante?.nome || 'Time B'}</Text>
                
                {!isEncerrada && !isGuest && (
                  <View style={styles.stepperGroup}>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => decrementarGol(false)}>
                      <Ionicons name="remove" size={20} color="#09090B" />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{golsVisitante}</Text>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => incrementarGol(false)}>
                      <Ionicons name="add" size={20} color="#09090B" />
                    </TouchableOpacity>
                  </View>
                )}
                {isEncerrada && <Text style={styles.finalScore}>{partida.golsVisitante}</Text>}
              </View>
            </View>

            {!isEncerrada && !isGuest && (
              <TouchableOpacity
                style={[styles.submitButton, enviando && styles.submitDisabled]}
                activeOpacity={0.85}
                onPress={salvarAcaoPalpite}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>{editando ? 'Atualizar palpite' : 'Confirmar palpite'}</Text>
                )}
              </TouchableOpacity>
            )}

            {!isEncerrada && isGuest && (
              <TouchableOpacity
                style={styles.submitButton}
                activeOpacity={0.85}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.submitText}>Faça Login para Palpitar</Text>
              </TouchableOpacity>
            )}

            {isEncerrada && (
              <View style={styles.encerradaBanner}>
                <Ionicons name="lock-closed-outline" size={18} color="#8896A6" />
                <Text style={styles.encerradaText}>Partida encerrada — palpites bloqueados</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#09090B',
  },
  metaSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  fasePill: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  faseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090B',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#09090B',
    textTransform: 'capitalize',
    textAlign: 'center',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#71717A',
    marginLeft: 4,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#09090B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  flagContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  vsCol: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsTextLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 20,
    fontWeight: '800',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#09090B',
    marginHorizontal: 12,
    minWidth: 28,
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  submitButton: {
    height: 54,
    backgroundColor: '#09090B',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  encerradaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
  },
  encerradaText: {
    marginLeft: 8,
    color: '#71717A',
    fontSize: 14,
    fontWeight: '500',
  },
});
