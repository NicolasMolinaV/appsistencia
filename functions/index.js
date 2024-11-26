const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Cloud Function para eliminar un usuario de Firebase Authentication
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Verifica que la solicitud está autenticada
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tienes permiso para ejecutar esta acción.'
    );
  }

  const uid = data.uid;
  try {
    await admin.auth().deleteUser(uid);
    return { message: 'Usuario eliminado exitosamente de Authentication.' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error eliminando el usuario.');
  }
});
