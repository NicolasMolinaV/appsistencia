import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UserCredential } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, arrayUnion } from '@angular/fire/firestore';

interface UserData {
  uid: string;
  email?: string;
  usuario?: string;
  tipo_usuario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) { }

  // Método para cerrar sesión
  async logout() {
    return signOut(this.auth);
  }

  // Método para iniciar sesión
  async login(email: string, password: string): Promise<UserData> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);

      const userDocRef = doc(this.firestore, `users/${userCredential.user.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData; 
        return { ...userData, uid: userCredential.user.uid }; 
      } else {
        throw new Error('No se encontró el documento del usuario');
      }
    } catch (error) {
      console.error('No se pudo iniciar sesión correctamente:', error);
      throw new Error('No se pudo iniciar sesión correctamente');
    }
  }

  // Método para obtener el usuario actual
  async getCurrentUser(): Promise<UserData | null> {
    const token = localStorage.getItem('token');
    if (!token) return null; 

    const user = this.auth.currentUser; 
    if (!user) return null; 

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      return { ...userData, uid: user.uid }; 
    }

    return null; 
  }

  // Método para registrar un nuevo usuario y guardar datos en Firestore
  async register(email: string, password: string, usuario: string) {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      console.log('Token almacenado:', token);

      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        usuario: usuario,
        tipo_usuario: "alumno"  
      });

      console.log('Usuario registrado y guardado en Firestore');

      return userCredential;
    } catch (error) {
      console.error('No se pudo registrar el usuario correctamente:', error);
      throw new Error('No se pudo registrar el usuario correctamente');
    }
  }

async addStudentToList(documentId: string, uid: string): Promise<void> {
  const docRef = doc(this.firestore, `asistencia/${documentId}`); 
  console.log('Intentando actualizar el documento:', documentId);

  try {
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      console.log('Documento encontrado. Agregando UID al array...');
      await updateDoc(docRef, {
        id_alumnos: arrayUnion(uid), 
      });
      console.log('UID agregado correctamente.');
    } else {
      console.log('El documento no existe. Creándolo ahora...');
      await setDoc(docRef, {
        id_alumnos: [uid], 
      });
      console.log('Documento creado y UID agregado correctamente.');
    }
  } catch (error) {
    console.error('Error al agregar el UID al documento:', error);
    throw error;
  }
}

  
}
