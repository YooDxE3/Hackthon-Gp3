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
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function TelaInicio() {
  const router = useRouter();

  const [proximaPartida, setProximaPartida] = useState<Partida | null>(null);
  const [palpiteRecente, setPalpiteRecente] = useState<any>(null);
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
  const [idUsuarioAtual, setIdUsuarioAtual] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregarDados = async () => {
    try {
      const email = await AsyncStorage.getItem('user_email');
      const token = await AsyncStorage.getItem('jwt_token');
      const isUserGuest = !token;
      setIsGuest(isUserGuest);
      
      const [partidasData, palpitesData, rankingData, usuariosResponse] = await Promise.all([
        buscarPartidas().catch(() => []),
        isUserGuest ? Promise.resolve([]) : buscarMeusPalpites().catch(() => []),
        buscarRanking().catch(() => []),
        api.get('/usuarios').catch(() => null)
      ]);
      
      const agendadas = partidasData
        .filter((m: Partida) => m.status === 'AGENDADA')
        .sort((a: Partida, b: Partida) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
      setProximaPartida(agendadas.length > 0 ? agendadas[0] : null);

      if (palpitesData && palpitesData.length > 0) {
        const pending = palpitesData.find((p: any) => p.statusPartida !== 'ENCERRADA') || palpitesData[0];
        const partida = partidasData.find((p: any) => p.id === pending.partidaId);
        
        setPalpiteRecente({
          ...pending,
          escudoMandante: partida?.mandante?.escudoUrl,
          escudoVisitante: partida?.visitante?.escudoUrl,
        });
      } else {
        setPalpiteRecente(null);
      }

      setRanking(rankingData || []);

      if (email && usuariosResponse?.data) {
        const loggedUser = usuariosResponse.data.find((u: any) => u.email === email);
        if (loggedUser) {
          setIdUsuarioAtual(loggedUser.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setAtualizando(true);
    carregarDados();
  }, []);

  const formatarData = (dateString: string) => {
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

  const obterEmojiMedalha = (pos: number) => {
    if (pos === 0) return '🥇';
    if (pos === 1) return '🥈';
    if (pos === 2) return '🥉';
    return null;
  };

  const renderizarCardDestaque = (item: Partida) => {
    const dt = formatarData(item.dataHora);
    return (
      <TouchableOpacity
        style={styles.heroBox}
        activeOpacity={0.9}
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View style={styles.heroOverlay} />
        
        <View style={styles.heroMetaTop}>
          <Text style={styles.heroDate}>{dt.short}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{item.fase}</Text>
          </View>
        </View>

        <View style={styles.heroTeamsRow}>
          <View style={styles.heroTeamCol}>
            <View style={styles.heroFlagWrap}>
              {item.mandante?.escudoUrl ? (
                <Image source={{ uri: item.mandante.escudoUrl }} style={styles.heroFlagImg} />
              ) : <Text style={{fontSize: 24}}>🏴</Text>}
            </View>
            <Text style={styles.heroTeamText} numberOfLines={1}>{item.mandante?.nome}</Text>
          </View>
          
          <View style={styles.heroVsCol}>
             <Text style={styles.heroVsText}>VS</Text>
             <Text style={styles.heroStadiumText} numberOfLines={1}>{item.estadio?.split(',')[0]}</Text>
          </View>
          
          <View style={styles.heroTeamCol}>
            <View style={styles.heroFlagWrap}>
              {item.visitante?.escudoUrl ? (
                <Image source={{ uri: item.visitante.escudoUrl }} style={styles.heroFlagImg} />
              ) : <Text style={{fontSize: 24}}>🏴</Text>}
            </View>
            <Text style={styles.heroTeamText} numberOfLines={1}>{item.visitante?.nome}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderizarCardPalpite = (item: any) => {
    const isEncerrada = item.statusPartida === 'ENCERRADA';
    
    return (
      <View style={styles.cardBox}>
        <View style={styles.confrontoRow}>
           <View style={styles.miniFlag}>
             {item.escudoMandante ? <Image source={{uri: item.escudoMandante}} style={styles.flagImg} /> : <Text>🏴</Text>}
           </View>
           <Text style={styles.confrontoName}>{item.confronto.split(' x ')[0]}</Text>
           <View style={styles.scorePill}>
              <Text style={styles.scoreText}>{item.golsMandante} - {item.golsVisitante}</Text>
           </View>
           <Text style={styles.confrontoName}>{item.confronto.split(' x ')[1]}</Text>
           <View style={styles.miniFlag}>
             {item.escudoVisitante ? <Image source={{uri: item.escudoVisitante}} style={styles.flagImg} /> : <Text>🏳️</Text>}
           </View>
        </View>
        
        <View style={styles.metaBox}>
          {isEncerrada ? (
            <Text style={styles.metaText}>Finalizado • {item.pontosObtidos} pts</Text>
          ) : (
            <Text style={styles.metaText}>Palpite registrado, aguardando início</Text>
          )}
        </View>
      </View>
    );
  };

  const renderizarPreviaRanking = () => {
    if (ranking.length === 0) return <Text style={styles.emptyText}>Sem dados de ranking</Text>;
    
    const top3 = ranking.slice(0, 3);
    const myIndex = ranking.findIndex(u => u.id === idUsuarioAtual);
    
    return (
      <View style={styles.rankingBox}>
        {top3.map((item, index) => {
          const medal = obterEmojiMedalha(index);
          const isMe = item.id === idUsuarioAtual;
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
      <View style={styles.mainHeader}>
        <Image 
          source={require('../../../assets/images/copa-2026-logo.png')} 
          style={styles.logoImg} 
          resizeMode="contain" 
        />
      </View>

      {carregando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#09090B" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} colors={['#09090B']} />}
        >
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas Partidas</Text>
            <TouchableOpacity onPress={() => router.push('/partidas')}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {proximaPartida ? renderizarCardDestaque(proximaPartida) : <Text style={styles.emptyText}>Sem jogos agendados</Text>}

          {!isGuest && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meus Palpites</Text>
                <TouchableOpacity onPress={() => router.push('/meusPalpites')}>
                  <Text style={styles.sectionLink}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              {palpiteRecente ? renderizarCardPalpite(palpiteRecente) : <Text style={styles.emptyText}>Nenhum palpite recente</Text>}
            </>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ranking Geral</Text>
            <TouchableOpacity onPress={() => router.push('/ranking')}>
              <Text style={styles.sectionLink}>Ver ranking</Text>
            </TouchableOpacity>
          </View>
          {renderizarPreviaRanking()}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    color: '#3B82F6',
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
  heroBox: {
    backgroundColor: '#09090B',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#09090B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.15,
  },
  heroMetaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroDate: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTeamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTeamCol: {
    alignItems: 'center',
    flex: 1,
  },
  heroFlagWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroFlagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroTeamText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroVsCol: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  heroVsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroStadiumText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 80,
    textAlign: 'center',
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
  miniFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E4E4E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4D4D8',
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
