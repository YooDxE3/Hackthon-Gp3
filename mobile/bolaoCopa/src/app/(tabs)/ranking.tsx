import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarRanking, UsuarioRanking } from '../../services/rankingService';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RankingScreen() {
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const email = await AsyncStorage.getItem('user_email');
      const [rankingData, usuariosResponse] = await Promise.all([
        buscarRanking(),
        api.get('/usuarios').catch(() => null)
      ]);
      
      setRanking(rankingData);

      if (email && usuariosResponse?.data) {
        const loggedUser = usuariosResponse.data.find((u: any) => u.email === email);
        if (loggedUser) {
          setCurrentUserId(loggedUser.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do ranking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const getMedalEmoji = (pos: number) => {
    if (pos === 0) return '🥇';
    if (pos === 1) return '🥈';
    if (pos === 2) return '🥉';
    return null;
  };

  const renderRankingItem = ({ item, index }: { item: UsuarioRanking; index: number }) => {
    const isCurrentUser = item.id === currentUserId;
    const medal = getMedalEmoji(index);
    const isTop3 = index < 3;

    return (
      <View style={[styles.row, isCurrentUser && styles.rowHighlighted, isTop3 && styles.rowTop3]}>
        <View style={styles.posCol}>
          {medal ? (
            <Text style={styles.medal}>{medal}</Text>
          ) : (
            <Text style={styles.posNumber}>{index + 1}</Text>
          )}
        </View>

        <View style={styles.avatarCol}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.nameCol}>
          <Text style={[styles.nameText, isTop3 && styles.nameTextBold]} numberOfLines={1}>
            {item.nome}
          </Text>
          {isCurrentUser && <Text style={styles.youLabel}>Você</Text>}
        </View>

        <View style={styles.pointsCol}>
          <Text style={[styles.pointsText, isTop3 && styles.pointsTextTop]}>{item.pontuacaoTotal}</Text>
          <Text style={styles.ptsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Ranking</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1B7A4E" />
        </View>
      ) : ranking.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="trophy-outline" size={48} color="#D1D9E0" />
          <Text style={styles.emptyTitle}>Ninguém pontuou ainda</Text>
          <Text style={styles.emptySub}>Faça seus palpites e saia na frente!</Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRankingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, {width: 40}]}>#</Text>
              <Text style={[styles.thText, {flex: 1, marginLeft: 52}]}>Jogador</Text>
              <Text style={[styles.thText, {width: 60, textAlign: 'right'}]}>Pontos</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B3C',
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
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
    marginBottom: 4,
  },
  thText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8896A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
  },
  rowHighlighted: {
    backgroundColor: '#EBF5F0',
    marginHorizontal: -8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  rowTop3: {
    // subtle emphasis
  },
  posCol: {
    width: 40,
    alignItems: 'center',
  },
  medal: {
    fontSize: 20,
  },
  posNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8896A6',
  },
  avatarCol: {
    marginRight: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A5B6C',
  },
  nameCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A2B3C',
  },
  nameTextBold: {
    fontWeight: '700',
  },
  youLabel: {
    fontSize: 11,
    color: '#1B7A4E',
    fontWeight: '600',
    marginTop: 1,
  },
  pointsCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    width: 60,
    justifyContent: 'flex-end',
  },
  pointsText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2B3C',
    marginRight: 3,
  },
  pointsTextTop: {
    fontWeight: '800',
    color: '#1B7A4E',
  },
  ptsLabel: {
    fontSize: 12,
    color: '#8896A6',
    fontWeight: '500',
  },
});
