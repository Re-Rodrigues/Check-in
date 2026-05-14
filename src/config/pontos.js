export const PONTOS_INTERESSE = [
  {
    id: 'cantina',
    nome: 'Cantina',
    emoji: '🍽️',
    latitude: -21.76263,
    longitude: -43.35340,
    raio: 30,
  },
  {
    id: 'biblioteca',
    nome: 'Biblioteca',
    emoji: '📚',
    latitude: -21.76319,
    longitude: -43.35240,
    raio: 30,
  },
  {
    id: 'teatro',
    nome: 'Teatro',
    emoji: '🎭',
    latitude: -21.76289,
    longitude: -43.35273,
    raio: 30,
  },
  {
    id: 'anfiteatro',
    nome: 'Anfiteatro',
    emoji: '🎓',
    latitude: -21.76305,
    longitude: -43.35296,
    raio: 30,
  },
  {
    id: 'campo',
    nome: 'Campo',
    emoji: '⚽',
    latitude: -21.76264,
    longitude: -43.35410,
    raio: 30,
  },
];

export function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function verificarProximidade(userLat, userLon) {
  return PONTOS_INTERESSE.map((ponto) => {
    const distancia = calcularDistancia(
      userLat,
      userLon,
      ponto.latitude,
      ponto.longitude
    );
    return { ...ponto, distancia: Math.round(distancia), proximo: distancia <= ponto.raio };
  });
}
