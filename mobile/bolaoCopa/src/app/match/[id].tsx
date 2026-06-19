import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarPartidaPorId, Partida } from '../../services/partidaService';
import { salvarPalpite } from '../../services/palpiteService';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [partida, setPartida] = useState<Partida | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [golsMandante, setGolsMandante] = useState('');
  const [golsVisitante, setGolsVisitante] = useState('');

  useEffect(() => {
    const fetchPartida = async () => {
      try {
        const data = await buscarPartidaPorId(Number(id));
        setPartida(data);
      } catch (error) {
        console.error('Erro ao buscar partida:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes da partida.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPartida();
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

      Alert.alert('Sucesso!', 'Seu palpite foi registrado na API!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Erro ao salvar palpite:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao salvar o palpite. Verifique se o jogo já começou.');
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
        <ActivityIndicator size="large" color="#0274DF" />
      </SafeAreaView>
    );
  }

  const isEncerrada = partida.status === 'ENCERRADA';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Partida</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Match Info */}
        <View style={styles.infoBox}>
          <Text style={styles.faseText}>{partida.fase}</Text>
          <Text style={styles.dateText}>{formatDate(partida.dataHora)}</Text>
          <Text style={styles.stadiumText}>
            <Ionicons name="location" size={14} /> {partida.estadio || 'Estádio a definir'}
          </Text>
        </View>

        {/* Teams and Inputs */}
        <View style={styles.matchContainer}>
          {/* Mandante */}
          <View style={styles.teamSection}>
            <View style={styles.flagPlaceholder}>
              {partida.mandante?.bandeiraUrl ? (
                <Image source={{ uri: partida.mandante.bandeiraUrl }} style={styles.flagImage} />
              ) : (
                <Text style={styles.flagEmoji}>🏴</Text>
              )}
            </View>
            <Text style={styles.teamName}>{partida.mandante?.nome || 'Time A'}</Text>
            {isEncerrada ? (
              <Text style={styles.finalScore}>{partida.golsMandante}</Text>
            ) : (
              <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                maxLength={2}
                value={golsMandante}
                onChangeText={setGolsMandante}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
              />
            )}
          </View>

          <Text style={styles.vsText}>X</Text>

          {/* Visitante */}
          <View style={styles.teamSection}>
            <View style={styles.flagPlaceholder}>
              {partida.visitante?.bandeiraUrl ? (
                <Image source={{ uri: partida.visitante.bandeiraUrl }} style={styles.flagImage} />
              ) : (
                <Text style={styles.flagEmoji}>🏳️</Text>
              )}
            </View>
            <Text style={styles.teamName}>{partida.visitante?.nome || 'Time B'}</Text>
            {isEncerrada ? (
              <Text style={styles.finalScore}>{partida.golsVisitante}</Text>
            ) : (
              <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                maxLength={2}
                value={golsVisitante}
                onChangeText={setGolsVisitante}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
              />
            )}
          </View>
        </View>

        {/* Submit Button */}
        {!isEncerrada && (
          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Confirmar Palpite</Text>
            )}
          </TouchableOpacity>
        )}

        {isEncerrada && (
          <View style={styles.encerradaBox}>
            <Ionicons name="information-circle" size={24} color="#4B5563" />
            <Text style={styles.encerradaText}>Esta partida já foi encerrada e não aceita mais palpites.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  faseText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0274DF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  stadiumText: {
    fontSize: 14,
    color: '#6B7280',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 40,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  flagPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  flagImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  flagEmoji: {
    fontSize: 40,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreInput: {
    width: 70,
    height: 70,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#111827',
  },
  finalScore: {
    width: 70,
    height: 70,
    lineHeight: 70,
    backgroundColor: '#111827',
    borderRadius: 16,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#fff',
    overflow: 'hidden',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D1D5DB',
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#0274DF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0274DF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  encerradaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
  },
  encerradaText: {
    marginLeft: 12,
    flex: 1,
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  }
});
