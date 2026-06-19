import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarPartidas, Partida } from '../../services/partidaService';
import { Ionicons } from '@expo/vector-icons';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date).replace('de', '').trim();
    } catch {
      return dateString;
    }
  };

  const renderMatchCard = ({ item }: { item: Partida }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/match/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badgeFase}>
          <Text style={styles.faseText}>{item.fase}</Text>
        </View>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" /> {formatDate(item.dataHora)}
        </Text>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <View style={styles.flagPlaceholder}>
            {item.mandante?.bandeiraUrl ? (
              <Image source={{ uri: item.mandante.bandeiraUrl }} style={styles.flagImage} />
            ) : (
              <Text style={styles.flagEmoji}>🏴</Text>
            )}
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{item.mandante?.nome || 'Time A'}</Text>
        </View>

        <View style={styles.scoreBoard}>
          {item.status === 'ENCERRADA' ? (
            <View style={styles.scorePillEncerrada}>
              <Text style={styles.scoreText}>{item.golsMandante} - {item.golsVisitante}</Text>
              <Text style={styles.statusText}>FIM</Text>
            </View>
          ) : (
            <View style={styles.scorePill}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.palpiteAction}>Palpitar</Text>
            </View>
          )}
        </View>

        <View style={styles.team}>
          <View style={styles.flagPlaceholder}>
            {item.visitante?.bandeiraUrl ? (
              <Image source={{ uri: item.visitante.bandeiraUrl }} style={styles.flagImage} />
            ) : (
              <Text style={styles.flagEmoji}>🏳️</Text>
            )}
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{item.visitante?.nome || 'Time B'}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
        <Text style={styles.stadiumText}>{item.estadio || 'Estádio a definir'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Jogos da Copa</Text>
        <Text style={styles.subtitle}>Faça seus palpites nas próximas partidas</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0274DF" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>Nenhuma partida encontrada.</Text>
          <Text style={styles.emptySubtext}>Peça ao admin para cadastrar os jogos.</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMatchCard}
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
    padding: 16,
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
  badgeFase: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  faseText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  flagPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 28,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  scoreBoard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  palpiteAction: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0274DF',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  scorePillEncerrada: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stadiumText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
    fontWeight: '500',
  }
});
