import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth"; // Importamos as ferramentas de persistência
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAwIllm8soA6uZL1dU8Eon0UfoIs-OkfB8",
  authDomain: "caca-med.firebaseapp.com",
  projectId: "caca-med",
  storageBucket: "caca-med.firebasestorage.app",
  messagingSenderId: "24520481505",
  appId: "1:24520481505:web:5ddaedce367790d53735a0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// A MÁGICA AQUI: Dizemos para o Firebase esquecer o usuário assim que a sessão (aba/janela) for fechada
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Erro ao alterar a persistência do login:", error);
  });