import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
} from 'firebase/firestore';

const COLECAO = 'checkins';

export async function salvarCheckin(ponto) {
  try {
    const docRef = await addDoc(collection(db, COLECAO), {
      localId: ponto.id,
      localNome: ponto.nome,
      localEmoji: ponto.emoji,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      timestamp: Timestamp.now(),
      dataHora: new Date().toISOString(),
    });
    return { sucesso: true, id: docRef.id };
  } catch (erro) {
    console.error('Erro ao salvar check-in:', erro);
    return { sucesso: false, erro };
  }
}

export async function buscarCheckins() {
  try {
    const q = query(collection(db, COLECAO), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar check-ins:', erro);
    return [];
  }
}

export function formatarDataHora(isoString) {
  const data = new Date(isoString);
  return {
    data: data.toLocaleDateString('pt-BR'),
    hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    completo: data.toLocaleString('pt-BR'),
  };
}
