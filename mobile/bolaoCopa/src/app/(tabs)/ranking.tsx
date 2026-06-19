import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { buscarRanking, UsuarioRanking } from '../../services/rankingService';

export default function RankingScreen() {
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRanking = async () => {
    try {
      const data = await buscarRanking();
      setRanking(data);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRanking();
  }, []);

  const getMedalColor = (index: number) => {
    if (index === 0) return '#FBBF24'; // Ouro
    if (index === 1) return '#9CA3AF'; // Prata
    if (index === 2) return '#B45309'; // Bronze
    return null;
  };

  const renderRankingItem = ({ item, index }: { item: UsuarioRanking; index: number }) => {
    const medalColor = getMedalColor(index);
    const isTop3 = index < 3;

    return (
      <View style={[styles.card, isTop3 && styles.topCard]}>
        <View style={styles.positionContainer}>
          {medalColor ? (
            <FontAwesome5 name="medal" size={24} color={medalColor} />
          ) : (
            <Text style={styles.positionText}>{index + 1}º</Text>
          )}
        </View>

        <View style={styles.avatarPlaceholder}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={20} color="#9CA3AF" />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.statsText}>
            <Ionicons name="football" size={12} /> {item.placaresExatos} exatos
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.pontuacaoTotal}</Text>
          <Text style={styles.scoreLabel}>Pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking Global</Text>
        <Text style={styles.subtitle}>Os melhores do Bolão</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0274DF" />
        </View>
      ) : ranking.length === 0 ? (
        <View style={styles.centered}>
          <FontAwesome5 name="trophy" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>Ninguém pontuou ainda.</Text>
          <Text style={styles.emptySubtext}>Faça seus palpites e assuma a liderança!</Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRankingItem}
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
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  topCard: {
    borderWidth: 1,
    borderColor: '#FEF3C7',
    backgroundColor: '#FFFBDB',
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6B7280',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0274DF',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  }
});
