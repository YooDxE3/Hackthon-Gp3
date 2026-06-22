import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarPartidas, Partida } from '../../services/partidaService';
import { buscarMeusPalpites } from '../../services/palpiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


export default function TelaPartidas() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [palpitesIds, setPalpitesIds] = useState<number[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [faseSelecionada, setFaseSelecionada] = useState<string>('Todas');
  const [statusSelecionado, setStatusSelecionado] = useState<string>('Todos');
  const router = useRouter();

  const carregarPartidas = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const isGuest = !token;

      const [data, palpitesData] = await Promise.all([
        buscarPartidas(),
        isGuest ? Promise.resolve([]) : buscarMeusPalpites().catch(() => [])
      ]);
      setPartidas(data);
      setPalpitesIds(palpitesData.map((p: any) => p.partidaId));
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarPartidas();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setAtualizando(true);
    carregarPartidas();
  }, []);

  const formatarData = (dateString: string) => {
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
    const unicas = Array.from(new Set(partidas.map((m: Partida) => m.fase)));
    return ['Todas', ...unicas];
  }, [partidas]);

  const partidasFiltradas = useMemo(() => {
    let result = partidas;
    if (faseSelecionada !== 'Todas') {
      result = result.filter((m: Partida) => m.fase === faseSelecionada);
    }
    if (statusSelecionado !== 'Todos') {
      result = result.filter((m: Partida) => m.status === statusSelecionado);
    }
    return result;
  }, [partidas, faseSelecionada, statusSelecionado]);

  const partidasAgrupadas = useMemo(() => {
    const groups: Record<string, Partida[]> = {};
    partidasFiltradas.forEach((m: Partida) => {
      const dt = new Date(m.dataHora);
      const dateKey = dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
      const formattedDateKey = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
      if (!groups[formattedDateKey]) groups[formattedDateKey] = [];
      groups[formattedDateKey].push(m);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [partidasFiltradas]);

  const statuses = ['Todos', 'AGENDADA', 'EM_ANDAMENTO', 'ENCERRADA'];
  const statusLabels: Record<string, string> = {
    'Todos': 'Todos',
    'AGENDADA': 'Agendada',
    'EM_ANDAMENTO': 'Ao vivo',
    'ENCERRADA': 'Encerrada',
  };

  const renderizarCardPartida = ({ item }: { item: Partida }) => {
    const dt = formatarData(item.dataHora);
    const isEncerrada = item.status === 'ENCERRADA';
    const isPalpitado = palpitesIds.includes(item.id);

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
            <View style={{alignItems: 'center'}}>
              <Text style={styles.cardTime}>{dt.time}</Text>
              {isPalpitado && (
                <View style={styles.palpitadoBadge}>
                  <Ionicons name="checkmark-done" size={12} color="#10B981" />
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Jogos</Text>
        <Text style={styles.matchCount}>{partidasFiltradas.length} partidas</Text>
      </View>

      {!carregando && partidas.length > 0 && (
        <View style={styles.filtersWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentedContainer}
            style={styles.segmentedScroll}
          >
            {fases.map((fase) => (
              <TouchableOpacity
                key={fase}
                style={[styles.segmentedPill, faseSelecionada === fase && styles.segmentedPillActive]}
                onPress={() => setFaseSelecionada(fase)}
              >
                <Text style={[styles.segmentedText, faseSelecionada === fase && styles.segmentedTextActive]}>
                  {fase}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentedContainer}
            style={styles.segmentedScroll}
          >
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.segmentedPill, statusSelecionado === status && styles.segmentedPillActive]}
                onPress={() => setStatusSelecionado(status)}
              >
                <Text style={[styles.segmentedText, statusSelecionado === status && styles.segmentedTextActive]}>
                  {statusLabels[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {carregando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1B7A4E" />
        </View>
      ) : partidasFiltradas.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={48} color="#D1D9E0" />
          <Text style={styles.emptyTitle}>Nenhuma partida encontrada</Text>
          <Text style={styles.emptySub}>Ajuste os filtros ou aguarde novos jogos.</Text>
        </View>
      ) : (
        <SectionList
          sections={partidasAgrupadas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarCardPartida}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={onRefresh} colors={['#10B981']} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  filtersWrapper: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  segmentedScroll: {
    marginBottom: 12,
  },
  segmentedContainer: {
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
  },
  segmentedPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  segmentedPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  segmentedTextActive: {
    color: '#09090B',
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
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#52525B',
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
    borderWidth: 1,
    borderColor: '#D4D4D8',
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
  palpitadoBadge: {
    marginTop: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
});
