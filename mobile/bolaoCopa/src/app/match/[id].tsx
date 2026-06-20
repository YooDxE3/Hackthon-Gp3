import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarPartidaPorId, Partida } from '../../services/partidaService';
import { salvarPalpite, buscarMeusPalpites } from '../../services/palpiteService';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [partida, setPartida] = useState<Partida | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [golsMandante, setGolsMandante] = useState('');
  const [golsVisitante, setGolsVisitante] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partidaId = Number(id);
        const [partidaData, meusPalpitesData] = await Promise.all([
          buscarPartidaPorId(partidaId),
          buscarMeusPalpites().catch(() => [])
        ]);
        
        setPartida(partidaData);

        const existingPalpite = meusPalpitesData.find((p: any) => p.partidaId === partidaId);
        if (existingPalpite) {
          setGolsMandante(existingPalpite.golsMandante.toString());
          setGolsVisitante(existingPalpite.golsVisitante.toString());
          setIsEditing(true);
        }

      } catch (error) {
        console.error('Erro ao buscar dados da partida:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes da partida.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!golsMandante || !golsVisitante) {
      Alert.alert('Atenção', 'Preencha o placar para as duas seleções.');
      return;
    }

    try {
      setSubmitting(true);
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
      setSubmitting(false);
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

  if (loading || !partida) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B7A4E" />
      </SafeAreaView>
    );
  }

  const isEncerrada = partida.status === 'ENCERRADA';

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A2B3C" />
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
            {/* Meta info */}
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

            {/* Match card */}
            <View style={styles.matchCard}>
              <View style={styles.teamCol}>
                <View style={styles.flagContainer}>
                  {partida.mandante?.bandeiraUrl ? (
                    <Image source={{ uri: partida.mandante.bandeiraUrl }} style={styles.flagImg} />
                  ) : (
                    <Text style={{fontSize: 36}}>🏴</Text>
                  )}
                </View>
                <Text style={styles.teamName} numberOfLines={2}>{partida.mandante?.nome || 'Time A'}</Text>
              </View>

              <View style={styles.vsCol}>
                {isEncerrada ? (
                  <View style={styles.finalScoreRow}>
                    <Text style={styles.finalDigit}>{partida.golsMandante}</Text>
                    <Text style={styles.finalSep}>-</Text>
                    <Text style={styles.finalDigit}>{partida.golsVisitante}</Text>
                  </View>
                ) : (
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.scoreInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={golsMandante}
                      onChangeText={setGolsMandante}
                      placeholder="0"
                      placeholderTextColor="#C8CDD2"
                    />
                    <Text style={styles.inputSep}>-</Text>
                    <TextInput
                      style={styles.scoreInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={golsVisitante}
                      onChangeText={setGolsVisitante}
                      placeholder="0"
                      placeholderTextColor="#C8CDD2"
                    />
                  </View>
                )}
              </View>

              <View style={styles.teamCol}>
                <View style={styles.flagContainer}>
                  {partida.visitante?.bandeiraUrl ? (
                    <Image source={{ uri: partida.visitante.bandeiraUrl }} style={styles.flagImg} />
                  ) : (
                    <Text style={{fontSize: 36}}>🏳️</Text>
                  )}
                </View>
                <Text style={styles.teamName} numberOfLines={2}>{partida.visitante?.nome || 'Time B'}</Text>
              </View>
            </View>

            {!isEncerrada && (
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitDisabled]} 
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>{isEditing ? 'Atualizar palpite' : 'Confirmar palpite'}</Text>
                )}
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
    backgroundColor: '#FAFAF8',
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
    backgroundColor: '#FAFAF8',
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
    borderColor: '#E5E8EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2B3C',
  },
  metaSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  fasePill: {
    backgroundColor: '#EBF5F0',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  faseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B7A4E',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A2B3C',
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
    color: '#8896A6',
    marginLeft: 4,
  },
  // Match card
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F0F2F4',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  flagContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B3C',
    textAlign: 'center',
  },
  vsCol: {
    paddingHorizontal: 8,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  finalDigit: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A2B3C',
  },
  finalSep: {
    fontSize: 28,
    color: '#C8CDD2',
    marginHorizontal: 8,
    fontWeight: '300',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInput: {
    width: 56,
    height: 64,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E5E8EB',
    borderRadius: 14,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A2B3C',
  },
  inputSep: {
    fontSize: 24,
    color: '#C8CDD2',
    marginHorizontal: 10,
    fontWeight: '300',
  },
  submitButton: {
    height: 54,
    backgroundColor: '#1B7A4E',
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
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
  },
  encerradaText: {
    marginLeft: 8,
    color: '#6B7D8E',
    fontSize: 14,
    fontWeight: '500',
  },
});
