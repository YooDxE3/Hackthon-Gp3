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

  const totalPontos = palpites.reduce((acc, p) => acc + (p.pontosObtidos || 0), 0);
  const encerrados = palpites.filter(p => p.statusPartida === 'ENCERRADA').length;

  const renderPalpite = ({ item }: { item: MeuPalpite }) => {
    const isEncerrada = item.statusPartida === 'ENCERRADA';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.confrontoText}>{item.confronto}</Text>
          <View style={[styles.statusDot, isEncerrada ? styles.dotGray : styles.dotGreen]} />
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{item.golsMandante}</Text>
          <Text style={styles.scoreSep}>—</Text>
          <Text style={styles.scoreValue}>{item.golsVisitante}</Text>
        </View>

        {isEncerrada ? (
          <View style={styles.resultRow}>
            <Text style={styles.pointsText}>
              {item.pontosObtidos > 0 ? `+${item.pontosObtidos} pts` : '0 pts'}
            </Text>
            {item.criterioAplicado && (
              <Text style={styles.criterioText}>{item.criterioAplicado}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.pendingText}>Aguardando resultado</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Meus palpites</Text>
      </View>

      {!loading && palpites.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{palpites.length}</Text>
            <Text style={styles.statLabel}>Palpites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{encerrados}</Text>
            <Text style={styles.statLabel}>Encerrados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statValueGreen]}>{totalPontos}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1B7A4E" />
        </View>
      ) : palpites.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="clipboard-outline" size={48} color="#D1D9E0" />
          <Text style={styles.emptyTitle}>Nenhum palpite ainda</Text>
          <Text style={styles.emptySub}>Vá em Jogos e registre seu primeiro palpite!</Text>
        </View>
      ) : (
        <FlatList
          data={palpites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPalpite}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B7A4E']} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B3C',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0F2F4',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B3C',
  },
  statValueGreen: {
    color: '#1B7A4E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8896A6',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F2F4',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2B3C',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7D8E',
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F2F4',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confrontoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5B6C',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  dotGreen: {
    backgroundColor: '#1B7A4E',
  },
  dotGray: {
    backgroundColor: '#C8CDD2',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A2B3C',
  },
  scoreSep: {
    fontSize: 24,
    color: '#C8CDD2',
    marginHorizontal: 16,
    fontWeight: '300',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B7A4E',
  },
  criterioText: {
    fontSize: 12,
    color: '#8896A6',
    fontWeight: '500',
  },
  pendingText: {
    fontSize: 13,
    color: '#8896A6',
    textAlign: 'center',
    fontWeight: '500',
  },
});
