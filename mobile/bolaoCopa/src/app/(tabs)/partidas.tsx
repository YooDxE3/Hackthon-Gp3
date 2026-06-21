import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarPartidas, Partida } from '../../services/partidaService';
import { Ionicons } from '@expo/vector-icons';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFase, setSelectedFase] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const router = useRouter();

  const loadMatches = async () => {
    try {
      const data = await buscarPartidas();
      setMatches(data);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMatches();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return { day: String(day), month, time };
    } catch {
      return { day: '--', month: '---', time: '--:--' };
    }
  };

  const fases = useMemo(() => {
    const unicas = Array.from(new Set(matches.map(m => m.fase)));
    return ['Todas', ...unicas];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let result = matches;
    if (selectedFase !== 'Todas') {
      result = result.filter(m => m.fase === selectedFase);
    }
    if (selectedStatus !== 'Todos') {
      result = result.filter(m => m.status === selectedStatus);
    }
    return result;
  }, [matches, selectedFase, selectedStatus]);

  const statuses = ['Todos', 'AGENDADA', 'EM_ANDAMENTO', 'ENCERRADA'];
  const statusLabels: Record<string, string> = {
    'Todos': 'Todos',
    'AGENDADA': 'Agendada',
    'EM_ANDAMENTO': 'Ao vivo',
    'ENCERRADA': 'Encerrada',
  };

  const renderMatchCard = ({ item }: { item: Partida }) => {
    const dt = formatDate(item.dataHora);
    const isEncerrada = item.status === 'ENCERRADA';

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View style={styles.cardLeft}>
          <View style={styles.cardDate}>
            <Text style={styles.cardDay}>{dt.day}</Text>
            <Text style={styles.cardMonth}>{dt.month}</Text>
          </View>
        </View>

        <View style={styles.cardCenter}>
          <View style={styles.teamLine}>
            <View style={styles.miniFlag}>
              {item.mandante?.escudoUrl ? (
                <Image source={{ uri: item.mandante.escudoUrl }} style={styles.flagImg} />
              ) : <Text style={{fontSize: 14}}>🏴</Text>}
            </View>
            <Text style={styles.teamName} numberOfLines={1}>{item.mandante?.nome || 'Time A'}</Text>
            {isEncerrada && <Text style={styles.goalText}>{item.golsMandante}</Text>}
          </View>
          <View style={styles.teamLine}>
            <View style={styles.miniFlag}>
              {item.visitante?.escudoUrl ? (
                <Image source={{ uri: item.visitante.escudoUrl }} style={styles.flagImg} />
              ) : <Text style={{fontSize: 14}}>🏳️</Text>}
            </View>
            <Text style={styles.teamName} numberOfLines={1}>{item.visitante?.nome || 'Time B'}</Text>
            {isEncerrada && <Text style={styles.goalText}>{item.golsVisitante}</Text>}
          </View>
        </View>

        <View style={styles.cardRight}>
          {isEncerrada ? (
            <View style={styles.encerradaPill}>
              <Text style={styles.encerradaText}>Fim</Text>
            </View>
          ) : (
            <Text style={styles.cardTime}>{dt.time}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Jogos</Text>
        <Text style={styles.matchCount}>{filteredMatches.length} partidas</Text>
      </View>

      {!loading && matches.length > 0 && (
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {fases.map((fase) => (
              <TouchableOpacity
                key={fase}
                style={[styles.filterPill, selectedFase === fase && styles.filterPillActive]}
                onPress={() => setSelectedFase(fase)}
              >
                <Text style={[styles.filterText, selectedFase === fase && styles.filterTextActive]}>
                  {fase}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusPill, selectedStatus === status && styles.statusPillActive]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[styles.statusText, selectedStatus === status && styles.statusTextActive]}>
                  {statusLabels[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1B7A4E" />
        </View>
      ) : filteredMatches.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={48} color="#D1D9E0" />
          <Text style={styles.emptyTitle}>Nenhuma partida encontrada</Text>
          <Text style={styles.emptySub}>Ajuste os filtros ou aguarde novos jogos.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMatchCard}
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
    backgroundColor: '#FFFFFF', // Pure white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#09090B',
  },
  matchCount: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  filterRow: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAFAFA', // Zinc 50
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  filterPillActive: {
    backgroundColor: '#09090B',
    borderColor: '#09090B',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#52525B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusPillActive: {
    backgroundColor: '#F4F4F5', // Zinc 100
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#71717A',
  },
  statusTextActive: {
    color: '#09090B',
    fontWeight: '700',
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
    color: '#09090B',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  cardLeft: {
    marginRight: 14,
  },
  cardDate: {
    alignItems: 'center',
    width: 40,
  },
  cardDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#09090B',
    lineHeight: 22,
  },
  cardMonth: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  cardCenter: {
    flex: 1,
  },
  teamLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E4E4E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#09090B',
  },
  goalText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090B',
    marginLeft: 8,
    width: 20,
    textAlign: 'center',
  },
  cardRight: {
    marginLeft: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  cardTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090B',
  },
  encerradaPill: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  encerradaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525B',
  },
});
