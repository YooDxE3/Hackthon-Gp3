import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarMeusPalpites } from '../../services/palpiteService';

interface MeuPalpite {
  id: number;
  partidaId: number;
  confronto: string;
  golsMandante: number;
  golsVisitante: number;
  pontosObtidos: number;
  criterioAplicado: string | null;
  statusPartida: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA';
}

export default function MyPredictionsScreen() {
  const [palpites, setPalpites] = useState<MeuPalpite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPalpites = async () => {
    try {
      const data = await buscarMeusPalpites();
      setPalpites(data);
    } catch (error) {
      console.error('Erro ao buscar meus palpites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPalpites();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPalpites();
  }, []);

  const renderPalpite = ({ item }: { item: MeuPalpite }) => {
    const isEncerrada = item.statusPartida === 'ENCERRADA';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.confrontoText}>{item.confronto}</Text>
          <View style={[styles.statusBadge, isEncerrada && styles.statusBadgeEncerrada]}>
            <Text style={[styles.statusText, isEncerrada && styles.statusTextEncerrada]}>
              {item.statusPartida}
            </Text>
          </View>
        </View>

        <View style={styles.scoreBoard}>
          <Text style={styles.palpiteLabel}>SEU PALPITE</Text>
          <Text style={styles.scoreText}>
            {item.golsMandante} x {item.golsVisitante}
          </Text>
        </View>

        {isEncerrada && (
          <View style={styles.pointsContainer}>
            <View style={styles.pointsIcon}>
              <Ionicons name="star" size={16} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.pointsEarned}>+{item.pontosObtidos} Pontos</Text>
              <Text style={styles.pointsReason}>{item.criterioAplicado || 'Finalizado'}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Palpites</Text>
        <Text style={styles.subtitle}>Acompanhe seu desempenho</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0274DF" />
        </View>
      ) : palpites.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>Nenhum palpite ainda.</Text>
          <Text style={styles.emptySubtext}>Vá em Partidas e faça o seu primeiro palpite!</Text>
        </View>
      ) : (
        <FlatList
          data={palpites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPalpite}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0274DF']} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 5,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confrontoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeEncerrada: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statusTextEncerrada: {
    color: '#6B7280',
  },
  scoreBoard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  palpiteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pointsIcon: {
    marginRight: 12,
  },
  pointsEarned: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  pointsReason: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  }
});
