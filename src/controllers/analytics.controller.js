import { twitchGet } from '../services/twitch.service.js';

/**
 * GET /analytics/user?id=ID
 */
export async function getUser(req, res) {
  const userId = req.query.id;

  // 1. Validación del parámetro
  if (!userId) {
    return res.status(400).json({ error: "Invalid or missing 'id' parameter." });
  }

  try {
    // 2. Consulta a la API de Twitch
    const data = await twitchGet(`https://api.twitch.tv/helix/users?id=${userId}`);

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. Devolvemos la información del usuario
    return res.status(200).json(data.data[0]);
  } catch (err) {
    // 4. Manejo de errores
    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET /analytics/streams
 */
export async function getStreams(req, res) {
  try {
    const data = await twitchGet('https://api.twitch.tv/helix/streams');

    // Transformamos para devolver solo los campos que pide la prueba
    const streams = data.data.map(stream => ({
      title: stream.title,
      user_name: stream.user_name
    }));

    return res.status(200).json(streams);
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
