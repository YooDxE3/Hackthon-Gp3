import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarMeusPalpites } from '../../services/palpiteService';
import { buscarPartidas } from '../../services/partidaService';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

interface MeuPalpite {
  id: number;
  partidaId: number;
  confronto: string;
  golsMandante: number;
  golsVisitante: number;
  pontosObtidos: number;
  criterioAplicado: string | null;
  statusPartida: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA';
  escudoMandante?: string;
  escudoVisitante?: string;
}

export default function TelaMeusPalpites() {
  const [palpites, setPalpites] = useState<MeuPalpite[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const router = useRouter();

  const carregarPalpites = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        setIsGuest(true);
        setCarregando(false);
        setAtualizando(false);
        return;
      }
      setIsGuest(false);

      const [data, partidas] = await Promise.all([
        buscarMeusPalpites(),
        buscarPartidas().catch(() => [])
      ]);
      
      const enrichedData = data.map((palpite: any) => {
        const partida = partidas.find((p: any) => p.id === palpite.partidaId);
        return {
          ...palpite,
          escudoMandante: partida?.mandante?.escudoUrl,
          escudoVisitante: partida?.visitante?.escudoUrl,
        };
      });

      setPalpites(enrichedData);
    } catch (error) {
      console.error('Erro ao buscar meus palpites:', error);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarPalpites();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setAtualizando(true);
    carregarPalpites();
  }, []);

  const totalPontos = palpites.reduce((acc, p) => acc + (p.pontosObtidos || 0), 0);
  const encerrados = palpites.filter(p => p.statusPartida === 'ENCERRADA').length;
  
  const exatos = palpites.filter(p => p.criterioAplicado === 'PLACAR_EXATO').length;
  const parciais = palpites.filter(p => p.criterioAplicado === 'VENCEDOR' || (p.pontosObtidos > 0 && p.criterioAplicado !== 'PLACAR_EXATO')).length;
  const erros = encerrados - exatos - parciais;

  const renderizarPalpite = ({ item }: { item: MeuPalpite }) => {
    const isEncerrada = item.statusPartida === 'ENCERRADA';

    let cardStatusStyle = {};
    let statusText = '';
    let statusTextColor = {};

    if (isEncerrada) {
      if (item.criterioAplicado === 'PLACAR_EXATO') {
        cardStatusStyle = styles.cardPlacarExato;
        statusText = 'Placar Exato';
        statusTextColor = { color: Colors.accent };
      } else if (item.pontosObtidos > 0) {
        cardStatusStyle = styles.cardVencedor;
        statusText = 'Acerto de Vencedor';
        statusTextColor = { color: Colors.primaryDark };
      } else {
        cardStatusStyle = styles.cardErro;
        statusText = 'Erro';
        statusTextColor = { color: '#71717A' };
      }
    }

    return (
      <View style={[styles.card, cardStatusStyle]}>
        <View style={styles.cardTop}>
          <View style={styles.teamsHeader}>
            <View style={styles.miniFlag}>
              {item.escudoMandante ? <Image source={{uri: item.escudoMandante}} style={styles.flagImg} /> : <Text>🏴</Text>}
            </View>
            <Text style={styles.confrontoText}>{item.confronto}</Text>
            <View style={styles.miniFlag}>
              {item.escudoVisitante ? <Image source={{uri: item.escudoVisitante}} style={styles.flagImg} /> : <Text>🏳️</Text>}
            </View>
          </View>
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
            {statusText ? (
              <Text style={[styles.criterioText, statusTextColor]}>{statusText}</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.pendingRow}>
            <Text style={styles.pendingText}>Aguardando resultado</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/match/${item.partidaId}`)}>
              <Text style={styles.editBtnText}>Alterar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Meus palpites</Text>
      </View>

      {isGuest ? (
        <View style={styles.centered}>
          <Ionicons name="lock-closed-outline" size={48} color="#D1D9E0" />
          <Text style={styles.emptyTitle}>Funcionalidade exclusiva</Text>
          <Text style={styles.emptySub}>Crie uma conta ou faça login para registrar e acompanhar seus palpites da Copa!</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/login')} activeOpacity={0.8}>
             <Text style={styles.actionBtnText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {!carregando && palpites.length > 0 && (
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardTitle}>Seu Desempenho</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{palpites.length}</Text>
              <Text style={styles.statLabel}>Palpites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statValueGreen]}>{totalPontos}</Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </View>
          </View>
          
          {encerrados > 0 && (
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: Colors.accent }]} />
                <Text style={styles.breakdownNum}>{exatos}</Text>
                <Text style={styles.breakdownLabel}>Exatos</Text>
              </View>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.breakdownNum}>{parciais}</Text>
                <Text style={styles.breakdownLabel}>Vencedor</Text>
              </View>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: '#A1A1AA' }]} />
                <Text style={styles.breakdownNum}>{erros}</Text>
                <Text style={styles.breakdownLabel}>Erros</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {carregando ? (
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
          renderItem={renderizarPalpite}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={onRefresh} colors={['#1B7A4E']} />
          }
        />
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
  dashboardContainer: {
    marginHorizontal: 24,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090B',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#09090B',
  },
  statValueGreen: {
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E4E4E7',
    marginVertical: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  breakdownNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090B',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardPlacarExato: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.accentLight,
  },
  cardVencedor: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryLight,
  },
  cardErro: {
    borderColor: '#E4E4E7',
    borderWidth: 1,
    opacity: 0.8,
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
    color: '#52525B',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  dotGreen: {
    backgroundColor: '#09090B',
  },
  dotGray: {
    backgroundColor: '#D4D4D8', 
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
    color: '#09090B',
  },
  scoreSep: {
    fontSize: 24,
    color: '#D4D4D8',
    marginHorizontal: 16,
    fontWeight: '300',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    padding: 10,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090B',
  },
  criterioText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  pendingText: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  editBtn: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#09090B',
  },
  teamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniFlag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E4E4E7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D4D8',
    marginHorizontal: 8,
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionBtn: {
    marginTop: 24,
    backgroundColor: '#09090B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
