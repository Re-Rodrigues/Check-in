import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarCheckins, formatarDataHora } from '../services/checkinService';

export default function HistoricoScreen() {
  const [checkins, setCheckins] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarCheckins();
    }, [])
  );

  async function carregarCheckins() {
    setCarregando(true);
    const dados = await buscarCheckins();
    setCheckins(dados);
    setCarregando(false);
  }

  async function atualizar() {
    setAtualizando(true);
    const dados = await buscarCheckins();
    setCheckins(dados);
    setAtualizando(false);
  }

  function agruparPorData(lista) {
    const grupos = {};
    lista.forEach((item) => {
      const { data } = formatarDataHora(item.dataHora);
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(item);
    });
    return Object.entries(grupos).map(([data, itens]) => ({ data, itens }));
  }

  const grupos = agruparPorData(checkins);

  const totalHoje = checkins.filter((c) => {
    const { data } = formatarDataHora(c.dataHora);
    return data === new Date().toLocaleDateString('pt-BR');
  }).length;

  const locaisMaisVisitados = checkins.reduce((acc, c) => {
    acc[c.localNome] = (acc[c.localNome] || 0) + 1;
    return acc;
  }, {});
  const topLocal = Object.entries(locaisMaisVisitados).sort((a, b) => b[1] - a[1])[0];

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4f8ef7" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{checkins.length}</Text>
          <Text style={styles.statLabel}>Total check-ins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalHoje}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{topLocal ? (topLocal[0] || 'N/A') : '--'}</Text>
          <Text style={styles.statLabel}>Local favorito</Text>
        </View>
      </View>

      {checkins.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioEmoji}>📍</Text>
          <Text style={styles.vazioTexto}>Nenhum check-in ainda.</Text>
          <Text style={styles.vazioSub}>Aproxime-se de um ponto no mapa!</Text>
        </View>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.data}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor="#4f8ef7" />
          }
          renderItem={({ item: grupo }) => (
            <View style={styles.grupo}>
              <Text style={styles.grupoData}>📅 {grupo.data}</Text>
              {grupo.itens.map((checkin) => {
                const { hora } = formatarDataHora(checkin.dataHora);
                return (
                  <View key={checkin.id} style={styles.item}>
                    <View style={styles.itemEsquerda}>
                      <Text style={styles.itemEmoji}>{checkin.localEmoji}</Text>
                    </View>
                    <View style={styles.itemMeio}>
                      <Text style={styles.itemNome}>{checkin.localNome}</Text>
                      <Text style={styles.itemCoords}>
                        {checkin.latitude?.toFixed(5)}, {checkin.longitude?.toFixed(5)}
                      </Text>
                    </View>
                    <View style={styles.itemDireita}>
                      <Text style={styles.itemHora}>{hora}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
  loadingText: { color: '#aaa', marginTop: 12 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  statCard: { alignItems: 'center' },
  statNum: { color: '#4f8ef7', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioEmoji: { fontSize: 52, marginBottom: 12 },
  vazioTexto: { color: '#ddd', fontSize: 18, fontWeight: '600' },
  vazioSub: { color: '#888', marginTop: 6 },
  grupo: { marginTop: 20, paddingHorizontal: 16 },
  grupoData: {
    color: '#4f8ef7',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#4f8ef7',
  },
  itemEsquerda: { marginRight: 12 },
  itemEmoji: { fontSize: 28 },
  itemMeio: { flex: 1 },
  itemNome: { color: '#fff', fontWeight: '700', fontSize: 15 },
  itemCoords: { color: '#666', fontSize: 10, marginTop: 2, fontFamily: 'monospace' },
  itemDireita: { alignItems: 'flex-end' },
  itemHora: {
    color: '#4f8ef7',
    fontWeight: '600',
    fontSize: 14,
    backgroundColor: '#252540',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
