import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarRanking, UsuarioRanking } from '../../services/rankingService';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

export default function TelaRanking() {
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  const [idUsuarioAtual, setIdUsuarioAtual] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregarDados = async () => {
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
          setIdUsuarioAtual(loggedUser.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do ranking:', error);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const onRefresh = useCallback(() => {
    setAtualizando(true);
    carregarDados();
  }, []);



  const renderizarItemRanking = ({ item, index }: { item: UsuarioRanking; index: number }) => {
    const isCurrentUser = item.id === idUsuarioAtual;
    const realIndex = index + 3;

    return (
      <View style={[styles.row, isCurrentUser && styles.rowHighlighted]}>
        <View style={styles.posCol}>
          <Text style={styles.posNumber}>{realIndex + 1}</Text>
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
          <Text style={styles.nameText} numberOfLines={1}>
            {item.nome}
          </Text>
          {isCurrentUser && <Text style={styles.youLabel}>Você</Text>}
        </View>

        <View style={styles.pointsCol}>
          <Text style={styles.pointsText}>{item.pontuacaoTotal}</Text>
          <Text style={styles.ptsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  const renderizarPodio = () => {
    if (ranking.length === 0) return null;
    
    const first = ranking[0];
    const second = ranking.length > 1 ? ranking[1] : null;
    const third = ranking.length > 2 ? ranking[2] : null;

    const renderizarAvatarPodio = (user: UsuarioRanking) => {
      if (user.avatarUrl) {
        return <Image source={{ uri: user.avatarUrl }} style={styles.podiumAvatar} />;
      }
      return (
        <View style={styles.podiumAvatarFallback}>
          <Text style={styles.podiumAvatarInitial}>{user.nome.charAt(0).toUpperCase()}</Text>
        </View>
      );
    };

    return (
      <View style={styles.podiumContainer}>
        {second ? (
          <View style={[styles.podiumItem, { marginTop: 40 }]}>
            <Text style={styles.podiumMedal}>🥈</Text>
            <View style={[styles.podiumAvatarWrap, { borderColor: '#A1A1AA' }]}>
               {renderizarAvatarPodio(second)}
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{second.nome}</Text>
            <Text style={styles.podiumPts}>{second.pontuacaoTotal} pts</Text>
            <View style={[styles.podiumBase, { height: 70, backgroundColor: '#E4E4E7' }]} >
               <Text style={styles.podiumBaseText}>2</Text>
            </View>
          </View>
        ) : <View style={styles.podiumItem} />}

        {first ? (
          <View style={[styles.podiumItem, { zIndex: 10 }]}>
            <Text style={styles.podiumMedal}>🥇</Text>
            <View style={[styles.podiumAvatarWrap, { borderColor: Colors.accent }]}>
               {renderizarAvatarPodio(first)}
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{first.nome}</Text>
            <Text style={styles.podiumPts}>{first.pontuacaoTotal} pts</Text>
            <View style={[styles.podiumBase, { height: 110, backgroundColor: Colors.accentLight }]} >
               <Text style={styles.podiumBaseText}>1</Text>
            </View>
          </View>
        ) : <View style={styles.podiumItem} />}

        {third ? (
          <View style={[styles.podiumItem, { marginTop: 60 }]}>
            <Text style={styles.podiumMedal}>🥉</Text>
            <View style={[styles.podiumAvatarWrap, { borderColor: '#D4D4D8' }]}>
               {renderizarAvatarPodio(third)}
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{third.nome}</Text>
            <Text style={styles.podiumPts}>{third.pontuacaoTotal} pts</Text>
            <View style={[styles.podiumBase, { height: 50, backgroundColor: '#F4F4F5' }]} >
               <Text style={styles.podiumBaseText}>3</Text>
            </View>
          </View>
        ) : <View style={styles.podiumItem} />}
      </View>
    );
  };

  const myIndex = ranking.findIndex(u => u.id === idUsuarioAtual);
  const showStickyFooter = myIndex > 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Ranking</Text>
      </View>

      {carregando ? (
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
        <>
          <FlatList
            data={ranking.slice(3)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderizarItemRanking}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                {renderizarPodio()}
                {ranking.length > 3 && (
                  <View style={styles.tableHeader}>
                    <Text style={[styles.thText, {width: 40}]}>#</Text>
                    <Text style={[styles.thText, {flex: 1, marginLeft: 52}]}>Jogador</Text>
                    <Text style={[styles.thText, {width: 60, textAlign: 'right'}]}>Pontos</Text>
                  </View>
                )}
              </View>
            }
            refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} colors={['#09090B']} />}
          />
          {showStickyFooter && (
            <View style={styles.stickyFooter}>
              <View style={[styles.row, styles.rowHighlighted, { borderBottomWidth: 0, paddingVertical: 12 }]}>
                <View style={styles.posCol}>
                  <Text style={styles.posNumber}>{myIndex + 1}</Text>
                </View>

                <View style={styles.avatarCol}>
                  {ranking[myIndex].avatarUrl ? (
                    <Image source={{ uri: ranking[myIndex].avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>{ranking[myIndex].nome.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.nameCol}>
                  <Text style={styles.nameText} numberOfLines={1}>Você</Text>
                </View>

                <View style={styles.pointsCol}>
                  <Text style={styles.pointsText}>{ranking[myIndex].pontuacaoTotal}</Text>
                  <Text style={styles.ptsLabel}>pts</Text>
                </View>
              </View>
            </View>
          )}
        </>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
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
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    marginBottom: 4,
  },
  thText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  rowHighlighted: {
    backgroundColor: '#F4F4F5',
    marginHorizontal: -8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  rowTop3: {
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
    color: '#A1A1AA',
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
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#52525B',
  },
  nameCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#09090B',
  },
  nameTextBold: {
    fontWeight: '700',
  },
  youLabel: {
    fontSize: 11,
    color: '#09090B',
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
    color: '#09090B',
    marginRight: 3,
  },
  pointsTextTop: {
    fontWeight: '800',
    color: '#09090B',
  },
  ptsLabel: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumMedal: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumAvatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
  },
  podiumAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#52525B',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090B',
    marginBottom: 2,
    maxWidth: '90%',
    textAlign: 'center',
  },
  podiumPts: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 12,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumBaseText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.1)',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    paddingHorizontal: 24,
    paddingBottom: 24, 
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
});
