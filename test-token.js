import { getAccessToken, twitchGet } from './src/services/twitch.service.js';

async function test() {
  try {
    // Obtener token
    const token = await getAccessToken();
    console.log('Token obtenido:', token);

    // Hacer una llamada de prueba a Twitch (por ejemplo obtener info de un usuario genérico)
    const userId = '141981764'; // ID de ejemplo de Twitch (ej. "TwitchDev")
    const data = await twitchGet(`https://api.twitch.tv/helix/users?id=${userId}`);
    console.log('Datos del usuario:', data);
  } catch (err) {
    console.error('Error de prueba:', err.message);
  }
}

test();
