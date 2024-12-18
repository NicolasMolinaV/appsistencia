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

  async getAttendancePercentages(uid: string): Promise<{ classId: number; percentage: number }[]> {
    const attendancePercentages: { classId: number; percentage: number }[] = [];

    try {
      const attendanceCollectionRef = collection(this.firestore, 'asistencia');
      const snapshot = await getDocs(attendanceCollectionRef);

      // Mapa para contar clases totales y clases a las que el estudiante asistió
      const studentAttendanceMap: { [key: number]: { totalClasses: number; attendedClasses: number } } = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const classId = data['id_clase'];
        const studentIds = data['id_alumnos'] as string[];

        // Si el estudiante está en la lista de presentes
        if (!studentAttendanceMap[classId]) {
          studentAttendanceMap[classId] = { totalClasses: 0, attendedClasses: 0 };
        }

        studentAttendanceMap[classId].totalClasses++;

        if (studentIds.includes(uid)) {
          studentAttendanceMap[classId].attendedClasses++;
        }
      });

      // Calculamos el porcentaje de asistencia personal
      for (const [classId, { totalClasses, attendedClasses }] of Object.entries(studentAttendanceMap)) {
        const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        attendancePercentages.push({ classId: Number(classId), percentage });
      }
    } catch (error) {
      console.error('Error al obtener los porcentajes de asistencia:', error);
      throw error;
    }

    return attendancePercentages;
  }


  async getUserProfile(): Promise<UserData | null> {
    try {
      const currentUser = this.auth.currentUser;

      if (!currentUser) {
        console.error('No hay un usuario autenticado actualmente.');
        return null;
      }

      const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        console.log('Datos del perfil cargados:', userData);
        return { ...userData, uid: currentUser.uid };
      } else {
        console.error('No se encontró el documento del usuario en Firestore.');
        return null;
      }
    } catch (error) {
      console.error('Error al cargar los datos del perfil:', error);
      throw new Error('No se pudo cargar los datos del perfil.');
    }
  }
}
