import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_HakXIhqkjUQl0a0WoKY-mmEE1mPA-Qo",
  authDomain: "tarefasplus-a21f8.firebaseapp.com",
  projectId: "tarefasplus-a21f8",
  storageBucket: "tarefasplus-a21f8.appspot.com",
  messagingSenderId: "422285859660",
  appId: "1:422285859660:web:25dbb6cecce615105f0de9"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };
