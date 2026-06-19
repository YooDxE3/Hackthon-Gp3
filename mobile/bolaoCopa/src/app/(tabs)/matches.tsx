import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MatchesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Partidas</Text>
      <Text style={styles.subtitle}>Filtre e veja os jogos disponíveis para palpitar</Text>
      {/* Aqui virão os filtros e a listagem das partidas */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});
