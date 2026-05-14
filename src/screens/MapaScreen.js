import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { PONTOS_INTERESSE, verificarProximidade } from '../config/pontos';
import { salvarCheckin } from '../services/checkinService';

export default function MapaScreen() {
  const [localizacao, setLocalizacao] = useState(null);
  const [pontosStatus, setPontosStatus] = useState(
    PONTOS_INTERESSE.map((p) => ({ ...p, proximo: false, distancia: null }))
  );
  const [carregando, setCarregando] = useState(true);
  const [checkinFeito, setCheckinFeito] = useState({});
  const mapRef = useRef(null);

  const regioInicial = {
    latitude: -21.76289,
    longitude: -43.35320,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  };

  useEffect(() => {
    iniciarLocalizacao();
  }, []);

  async function iniciarLocalizacao() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos da localização para o check-in funcionar.'
        );
        setCarregando(false);
        return;
      }

      setCarregando(false);

      await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 2,
      },
      (novaLoc) => {
        const { latitude, longitude } = novaLoc.coords;
        setLocalizacao({ latitude, longitude });

        const pontos = verificarProximidade(latitude, longitude);
        setPontosStatus(pontos);

        pontos.forEach(async (ponto) => {
          if (ponto.proximo && !checkinFeito[ponto.id]) {
            setCheckinFeito((prev) => ({ ...prev, [ponto.id]: true }));
            const resultado = await salvarCheckin(ponto);
            if (resultado.sucesso) {
              Alert.alert(
                '✅ Check-in realizado!',
                `Você fez check-in em: ${ponto.emoji} ${ponto.nome}`,
                [{ text: 'OK' }]
              );
            }
            setTimeout(() => {
              setCheckinFeito((prev) => ({ ...prev, [ponto.id]: false }));
            }, 60000);
          }
        });
      }
    );
    } catch (erro) {
      console.error('Erro ao iniciar localização:', erro);
      Alert.alert('Erro', 'Não foi possível acessar a localização.');
      setCarregando(false);
    }
  }

  function centralizarMapa() {
    if (localizacao && mapRef.current) {
      mapRef.current.animateToRegion({
        ...localizacao,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
    }
  }

  const pontosProximos = pontosStatus.filter((p) => p.proximo);

  return (
    <View style={styles.container}>
      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4f8ef7" />
          <Text style={styles.loadingText}>Obtendo localização...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.mapa}
            initialRegion={regioInicial}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {pontosStatus.map((ponto) => (
              <React.Fragment key={ponto.id}>
                <Marker
                  coordinate={{
                    latitude: ponto.latitude,
                    longitude: ponto.longitude,
                  }}
                  title={`${ponto.emoji} ${ponto.nome}`}
                  description={
                    ponto.distancia != null
                      ? `${ponto.distancia}m de distância`
                      : ''
                  }
                  pinColor={ponto.proximo ? '#e63946' : '#4f8ef7'}
                />
                <Circle
                  center={{ latitude: ponto.latitude, longitude: ponto.longitude }}
                  radius={ponto.raio}
                  fillColor={
                    ponto.proximo
                      ? 'rgba(230, 57, 70, 0.15)'
                      : 'rgba(79, 142, 247, 0.12)'
                  }
                  strokeColor={ponto.proximo ? '#e63946' : '#4f8ef7'}
                  strokeWidth={1.5}
                />
              </React.Fragment>
            ))}
          </MapView>

          {/* Botão centralizar */}
          <TouchableOpacity style={styles.btnCentralizar} onPress={centralizarMapa}>
            <Text style={styles.btnCentralizarIcon}>📍</Text>
          </TouchableOpacity>

          {/* Painel inferior */}
          <View style={styles.painel}>
            {pontosProximos.length > 0 ? (
              <>
                <Text style={styles.painelTitulo}>🔴 Você está em:</Text>
                {pontosProximos.map((p) => (
                  <View key={p.id} style={styles.painelProximo}>
                    <Text style={styles.painelProximoTexto}>
                      {p.emoji} {p.nome}
                    </Text>
                    <Text style={styles.painelProximoDist}>✅ Check-in automático</Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.painelTexto}>
                🔵 Aproxime-se de um ponto para fazer check-in
              </Text>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.distancias}>
              {pontosStatus.map((p) => (
                <View
                  key={p.id}
                  style={[styles.card, p.proximo && styles.cardAtivo]}
                >
                  <Text style={styles.cardEmoji}>{p.emoji}</Text>
                  <Text style={styles.cardNome}>{p.nome}</Text>
                  <Text style={[styles.cardDist, p.proximo && styles.cardDistAtivo]}>
                    {p.distancia != null ? `${p.distancia}m` : '--'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  mapa: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#aaa', marginTop: 12, fontSize: 15 },
  btnCentralizar: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btnCentralizarIcon: { fontSize: 22 },
  painel: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  painelTitulo: { color: '#e63946', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  painelProximo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a1a1e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  painelProximoTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
  painelProximoDist: { color: '#4caf50', fontSize: 12 },
  painelTexto: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  distancias: { marginTop: 10 },
  card: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 80,
    borderWidth: 1.5,
    borderColor: '#4f8ef7',
  },
  cardAtivo: { backgroundColor: '#3a0a10', borderColor: '#e63946' },
  cardEmoji: { fontSize: 22 },
  cardNome: { color: '#ddd', fontSize: 10, textAlign: 'center', marginTop: 4 },
  cardDist: { color: '#4f8ef7', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  cardDistAtivo: { color: '#e63946' },
});
