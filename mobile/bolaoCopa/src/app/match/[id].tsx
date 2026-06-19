import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [goalsA, setGoalsA] = useState('');
  const [goalsB, setGoalsB] = useState('');

  const handleSavePrediction = () => {
    Alert.alert('Sucesso', 'Palpite salvo com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Detalhes da Partida</Text>
      <Text style={styles.subtitle}>Partida ID: {id}</Text>

      <View style={styles.predictionCard}>
        <Text style={styles.cardTitle}>Seu Palpite</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.teamName}>Seleção A</Text>
          <TextInput 
            style={styles.scoreInput} 
            keyboardType="number-pad"
            value={goalsA}
            onChangeText={setGoalsA}
            maxLength={2}
          />
          <Text style={styles.vs}>X</Text>
          <TextInput 
            style={styles.scoreInput} 
            keyboardType="number-pad"
            value={goalsB}
            onChangeText={setGoalsB}
            maxLength={2}
          />
          <Text style={styles.teamName}>Seleção B</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSavePrediction}>
          <Text style={styles.saveButtonText}>Salvar Palpite</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#e5e5ea', marginTop: 10 }]} onPress={() => router.back()}>
          <Text style={[styles.saveButtonText, { color: '#000' }]}>Voltar</Text>
        </TouchableOpacity>
      </View>
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
  predictionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'center',
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: 50,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 10,
  },
  vs: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#0274DF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
