import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { createUserWithEmailAndPassword, UserCredential, getAuth } from 'firebase/auth';

interface UserData {
  uid: string; 
  email?: string; 
  usuario?: string;
  tipo_usuario?: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
  users: UserData[] = [];
  selectedUser: UserData | null = null;

  // Variables para el formulario de registro
  email: string = '';
  password: string = '';
  usuario: string = '';
  tipoUsuario: string = '';

  // Controlar la visibilidad del formulario de registro
  isRegisterFormVisible: boolean = false;

  constructor(private firestore: Firestore, private toastController: ToastController) { }

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const userDocs = await getDocs(usersCollection);
      this.users = userDocs.docs.map(doc => {
        const data = doc.data() as Omit<UserData, 'uid'>;
        return { uid: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  toggleRegisterForm() {
    this.isRegisterFormVisible = !this.isRegisterFormVisible;
    this.selectedUser = null; // Ocultar el formulario de edición si se muestra el de registro
  }

  selectUser(user: UserData) {
    this.selectedUser = { ...user };
    this.isRegisterFormVisible = false; // Ocultar el formulario de registro si se muestra el de edición
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  async saveChanges() {
    if (this.selectedUser) {
      const userDocRef = doc(this.firestore, `users/${this.selectedUser.uid}`);
      try {
        await updateDoc(userDocRef, {
          usuario: this.selectedUser.usuario,
          tipo_usuario: this.selectedUser.tipo_usuario,
        });
        this.presentToast('Usuario actualizado correctamente');
        this.selectedUser = null;
        this.loadUsers();
      } catch (error) {
        console.error('Error updating user:', error);
        this.presentToast('Error al actualizar el usuario');
      }
    }
  }

  async deleteUser(user: UserData) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    try {
      await deleteDoc(userDocRef);
      this.presentToast('Usuario eliminado correctamente');
      this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      this.presentToast('Error al eliminar el usuario');
    }
  }

  async register() {
    try {
      const auth = getAuth();
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);

      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: this.email,
        usuario: this.usuario,
        tipo_usuario: this.tipoUsuario
      });

      this.presentToast('Usuario registrado correctamente');
      this.isRegisterFormVisible = false;
      this.loadUsers(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('No se pudo registrar el usuario correctamente:', error);
      this.presentToast('No se pudo registrar el usuario correctamente');
    }
  }
}
