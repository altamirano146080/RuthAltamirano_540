import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let accessToken = null;
let tokenExpiresAt = null;

/**
 * Obtiene un token de acceso de Twitch usando client_id y client_secret.
 * Lo guarda en memoria y lo reutiliza mientras sea válido.
 */
export async function getAccessToken() {
  // Si ya tenemos token y no ha expirado, lo usamos
  if (accessToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
      }
    );

    accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in; // segundos
    tokenExpiresAt = new Date(new Date().getTime() + expiresIn * 1000);

    console.log('Token Twitch obtenido correctamente');

    return accessToken;
  } catch (err) {
    console.error('Error obteniendo token de Twitch:', err.response?.data || err.message);
    throw new Error('No se pudo obtener token de Twitch');
  }
}

/**
 * Hace una llamada GET a la API de Twitch con token válido.
 * @param {string} url La URL completa de la API de Twitch
 */
export async function twitchGet(url) {
  const token = await getAccessToken();

  try {
    const response = await axios.get(url, {
      headers: {
        'Client-Id': process.env.CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err) {
    console.error('Error en llamada a Twitch:', err.response?.data || err.message);
    throw err;
  }
}
