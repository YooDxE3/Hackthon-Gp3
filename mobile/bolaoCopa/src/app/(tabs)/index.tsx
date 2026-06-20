import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarPartidas, Partida } from '../../services/partidaService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [upcomingMatches, setUpcomingMatches] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadUpcomingMatches = async () => {
    try {
      const data = await buscarPartidas();
      const agendadas = data
        .filter(m => m.status === 'AGENDADA')
        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
      
      setUpcomingMatches(agendadas);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUpcomingMatches();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUpcomingMatches();
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

  const renderHighlightCard = (item: Partida) => {
    const dt = formatDate(item.dataHora);
    return (
      <TouchableOpacity
        key={`highlight-${item.id}`}
        style={styles.highlightCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View style={styles.highlightBadge}>
          <Text style={styles.highlightBadgeText}>Próximo jogo</Text>
        </View>
        <View style={styles.highlightTeams}>
          <View style={styles.highlightTeam}>
            <View style={styles.highlightFlag}>
              {item.mandante?.bandeiraUrl ? (
                <Image source={{ uri: item.mandante.bandeiraUrl }} style={styles.flagImg} />
              ) : (
                <Text style={{fontSize: 28}}>🏴</Text>
              )}
            </View>
            <Text style={styles.highlightTeamName} numberOfLines={1}>{item.mandante?.nome || 'Time A'}</Text>
          </View>
          <View style={styles.highlightMiddle}>
            <Text style={styles.highlightTime}>{dt.time}</Text>
            <Text style={styles.highlightDate}>{dt.day} {dt.month}</Text>
          </View>
          <View style={styles.highlightTeam}>
            <View style={styles.highlightFlag}>
              {item.visitante?.bandeiraUrl ? (
                <Image source={{ uri: item.visitante.bandeiraUrl }} style={styles.flagImg} />
              ) : (
                <Text style={{fontSize: 28}}>🏳️</Text>
              )}
            </View>
            <Text style={styles.highlightTeamName} numberOfLines={1}>{item.visitante?.nome || 'Time B'}</Text>
          </View>
        </View>
        <View style={styles.highlightFooter}>
          <View style={styles.highlightMeta}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.highlightStadium}>{item.estadio || 'A definir'}</Text>
          </View>
          <Text style={styles.highlightCta}>Palpitar →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatchItem = ({ item }: { item: Partida }) => {
    const dt = formatDate(item.dataHora);
    return (
      <TouchableOpacity
        style={styles.matchRow}
        activeOpacity={0.7}
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View style={styles.matchDate}>
          <Text style={styles.matchDay}>{dt.day}</Text>
          <Text style={styles.matchMonth}>{dt.month}</Text>
        </View>
        <View style={styles.matchInfo}>
          <View style={styles.matchTeamRow}>
            <View style={styles.miniFlag}>
              {item.mandante?.bandeiraUrl ? (
                <Image source={{ uri: item.mandante.bandeiraUrl }} style={styles.flagImg} />
              ) : <Text style={{fontSize: 14}}>🏴</Text>}
            </View>
            <Text style={styles.matchTeamName} numberOfLines={1}>{item.mandante?.nome || 'Time A'}</Text>
          </View>
          <View style={styles.matchTeamRow}>
            <View style={styles.miniFlag}>
              {item.visitante?.bandeiraUrl ? (
                <Image source={{ uri: item.visitante.bandeiraUrl }} style={styles.flagImg} />
              ) : <Text style={{fontSize: 14}}>🏳️</Text>}
            </View>
            <Text style={styles.matchTeamName} numberOfLines={1}>{item.visitante?.nome || 'Time B'}</Text>
          </View>
        </View>
        <View style={styles.matchRight}>
          <Text style={styles.matchTime}>{dt.time}</Text>
          <Text style={styles.matchFase}>{item.fase}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  const restMatches = upcomingMatches.slice(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bolão da Copa</Text>
          <Text style={styles.headerSub}>Faça seus palpites e suba no ranking</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={22} color="#4A5B6C" />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1B7A4E" />
        </View>
      ) : upcomingMatches.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="calendar-outline" size={56} color="#D1D9E0" />
          <Text style={styles.emptyTitle}>Sem jogos agendados</Text>
          <Text style={styles.emptySub}>Confira o ranking enquanto aguarda.</Text>
        </View>
      ) : (
        <FlatList
          data={restMatches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {nextMatch && renderHighlightCard(nextMatch)}
              {restMatches.length > 0 && (
                <Text style={styles.sectionLabel}>Próximas partidas</Text>
              )}
            </View>
          }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B3C',
  },
  headerSub: {
    fontSize: 14,
    color: '#6B7D8E',
    marginTop: 2,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E8EB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2B3C',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7D8E',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // --- Highlight card (next match) ---
  highlightCard: {
    backgroundColor: '#1B7A4E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },
  highlightBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
  },
  highlightBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  highlightTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  highlightTeam: {
    flex: 1,
    alignItems: 'center',
  },
  highlightFlag: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  highlightTeamName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightMiddle: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  highlightTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  highlightDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 2,
  },
  highlightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  highlightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightStadium: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginLeft: 4,
  },
  highlightCta: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // --- List ---
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B3C',
    marginBottom: 16,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F2F4',
  },
  matchDate: {
    width: 44,
    alignItems: 'center',
    marginRight: 14,
  },
  matchDay: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B3C',
    lineHeight: 24,
  },
  matchMonth: {
    fontSize: 12,
    color: '#8896A6',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  matchInfo: {
    flex: 1,
  },
  matchTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
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
  matchTeamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B3C',
  },
  matchRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  matchTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B7A4E',
  },
  matchFase: {
    fontSize: 11,
    color: '#8896A6',
    fontWeight: '500',
    marginTop: 2,
  },
});
