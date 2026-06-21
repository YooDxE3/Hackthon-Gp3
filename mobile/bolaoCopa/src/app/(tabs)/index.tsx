import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { buscarPartidas, Partida } from '../../services/partidaService';
import { buscarMeusPalpites } from '../../services/palpiteService';
import { buscarRanking, UsuarioRanking } from '../../services/rankingService';
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();

  const [upcomingMatch, setUpcomingMatch] = useState<Partida | null>(null);
  const [recentPalpite, setRecentPalpite] = useState<any>(null);
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const email = await AsyncStorage.getItem('user_email');
      
      const [partidasData, palpitesData, rankingData, usuariosResponse] = await Promise.all([
        buscarPartidas().catch(() => []),
        buscarMeusPalpites().catch(() => []),
        buscarRanking().catch(() => []),
        api.get('/usuarios').catch(() => null)
      ]);
      
      // Próxima partida agendada
      const agendadas = partidasData
        .filter((m: Partida) => m.status === 'AGENDADA')
        .sort((a: Partida, b: Partida) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
      setUpcomingMatch(agendadas.length > 0 ? agendadas[0] : null);

      // Último palpite
      if (palpitesData && palpitesData.length > 0) {
        const pending = palpitesData.find((p: any) => p.statusPartida !== 'ENCERRADA');
        setRecentPalpite(pending || palpitesData[0]);
      } else {
        setRecentPalpite(null);
      }

      setRanking(rankingData || []);

      if (email && usuariosResponse?.data) {
        const loggedUser = usuariosResponse.data.find((u: any) => u.email === email);
        if (loggedUser) {
          setCurrentUserId(loggedUser.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return { short: `${day}/${month} - ${time}`, time };
    } catch {
      return { short: '--/--', time: '--:--' };
    }
  };

  const getMedalEmoji = (pos: number) => {
    if (pos === 0) return '🥇';
    if (pos === 1) return '🥈';
    if (pos === 2) return '🥉';
    return null;
  };

  const renderHighlightCard = (item: Partida) => {
    const dt = formatDate(item.dataHora);
    return (
      <TouchableOpacity
        style={styles.cardBox}
        activeOpacity={0.9}
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View style={styles.teamsRow}>
          <View style={styles.teamHalf}>
            <View style={styles.flagWrap}>
              {item.mandante?.escudoUrl ? (
                <Image source={{ uri: item.mandante.escudoUrl }} style={styles.flagImg} />
              ) : <Text style={{fontSize: 20}}>🏴</Text>}
            </View>
            <Text style={styles.teamText} numberOfLines={1}>{item.mandante?.codigoFifa || item.mandante?.nome}</Text>
          </View>
          
          <Text style={styles.vsText}>vs</Text>
          
          <View style={[styles.teamHalf, { justifyContent: 'flex-end' }]}>
            <Text style={styles.teamText} numberOfLines={1}>{item.visitante?.codigoFifa || item.visitante?.nome}</Text>
            <View style={styles.flagWrap}>
              {item.visitante?.escudoUrl ? (
                <Image source={{ uri: item.visitante.escudoUrl }} style={styles.flagImg} />
              ) : <Text style={{fontSize: 20}}>🏴</Text>}
            </View>
          </View>
        </View>

        <View style={styles.metaBox}>
          <Text style={styles.metaText}>{dt.short}</Text>
          <Text style={styles.metaSubText}>{item.fase} - {item.grupo ? `Grupo ${item.grupo}` : 'A definir'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPalpiteCard = (item: any) => {
    const isEncerrada = item.statusPartida === 'ENCERRADA';
    
    return (
      <View style={styles.cardBox}>
        <View style={styles.confrontoRow}>
           <Text style={styles.confrontoName}>{item.confronto.split(' x ')[0]}</Text>
           <View style={styles.scorePill}>
              <Text style={styles.scoreText}>{item.golsMandante} - {item.golsVisitante}</Text>
           </View>
           <Text style={styles.confrontoName}>{item.confronto.split(' x ')[1]}</Text>
        </View>
        
        <View style={styles.metaBox}>
          {isEncerrada ? (
            <Text style={styles.metaText}>Finalizado • {item.pontosObtidos} pts</Text>
          ) : (
            <Text style={styles.metaText}>Aguardando partida</Text>
          )}
        </View>
      </View>
    );
  };

  const renderRankingPreview = () => {
    if (ranking.length === 0) return <Text style={styles.emptyText}>Sem dados de ranking</Text>;
    
    const top3 = ranking.slice(0, 3);
    const myIndex = ranking.findIndex(u => u.id === currentUserId);
    
    return (
      <View style={styles.rankingBox}>
        {top3.map((item, index) => {
          const medal = getMedalEmoji(index);
          const isMe = item.id === currentUserId;
          return (
            <View key={item.id} style={[styles.rankRow, isMe && styles.rankRowMe]}>
              <View style={styles.rankPos}>
                {medal ? <Text style={styles.rankMedal}>{medal}</Text> : <Text style={styles.rankNum}>{index + 1}</Text>}
              </View>
              <View style={styles.rankAvatar}>
                {item.avatarUrl ? (
                  <Image source={{uri: item.avatarUrl}} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.rankName}>{item.nome} {isMe && '(Você)'}</Text>
              <Text style={styles.rankPts}>{item.pontuacaoTotal} <Text style={styles.rankPtsLabel}>pts</Text></Text>
            </View>
          );
        })}

        {myIndex > 2 && (
          <>
            <View style={styles.dotsRow}>
              <Text style={styles.dotsText}>...</Text>
            </View>
            <View style={[styles.rankRow, styles.rankRowMe]}>
              <View style={styles.rankPos}>
                <Text style={styles.rankNum}>{myIndex + 1}</Text>
              </View>
              <View style={styles.rankAvatar}>
                {ranking[myIndex].avatarUrl ? (
                  <Image source={{uri: ranking[myIndex].avatarUrl}} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{ranking[myIndex].nome.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.rankName}>Você</Text>
              <Text style={styles.rankPts}>{ranking[myIndex].pontuacaoTotal} <Text style={styles.rankPtsLabel}>pts</Text></Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bolão */}
      <View style={styles.mainHeader}>
        <Image 
          source={require('../../../assets/images/copa-2026-logo.png')} 
          style={styles.logoImg} 
          resizeMode="contain" 
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#09090B" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#09090B']} />}
        >
          
          {/* Próximas Partidas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas Partidas</Text>
            <TouchableOpacity onPress={() => router.push('/partidas')}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {upcomingMatch ? renderHighlightCard(upcomingMatch) : <Text style={styles.emptyText}>Sem jogos agendados</Text>}

          {/* Meus Palpites */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meus Palpites</Text>
            <TouchableOpacity onPress={() => router.push('/meusPalpites')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {recentPalpite ? renderPalpiteCard(recentPalpite) : <Text style={styles.emptyText}>Nenhum palpite recente</Text>}

          {/* Ranking */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ranking Geral</Text>
            <TouchableOpacity onPress={() => router.push('/ranking')}>
              <Text style={styles.sectionLink}>Ver ranking</Text>
            </TouchableOpacity>
          </View>
          {renderRankingPreview()}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Slightly off-white for better card contrast
  },
  mainHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImg: {
    width: 140,
    height: 48,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090B',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6', // Link azul como no mockup
  },
  emptyText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagWrap: {
    width: 36,
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090B',
    marginHorizontal: 10,
  },
  vsText: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '600',
  },
  metaBox: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#09090B',
  },
  metaSubText: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  confrontoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confrontoName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090B',
    flex: 1,
    textAlign: 'center',
  },
  scorePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#09090B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#09090B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreText: {
    color: '#09090B',
    fontSize: 20,
    fontWeight: '800',
  },
  rankingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  rankRowMe: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderBottomWidth: 0,
  },
  rankPos: {
    width: 30,
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  rankMedal: {
    fontSize: 18,
  },
  rankAvatar: {
    marginHorizontal: 12,
  },
  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090B',
  },
  rankName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#09090B',
  },
  rankPts: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090B',
  },
  rankPtsLabel: {
    fontWeight: '500',
    color: '#71717A',
  },
  dotsRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dotsText: {
    fontSize: 16,
    color: '#A1A1AA',
    letterSpacing: 2,
  },
});
