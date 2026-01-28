import { twitchGet } from '../services/twitch.service.js';

/**
 * GET /analytics/user?id=ID
 */
export async function getUser(req, res) {
  const userId = req.query.id;

  if (!userId) {
    return res.status(400).json({ error: "Invalid or missing 'id' parameter." });
  }

  try {
    const data = await twitchGet(`https://api.twitch.tv/helix/users?id=${userId}`);

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(data.data[0]);
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    }
    
    if (err.response?.status === 400) {
      return res.status(404).json({ error: "User not found." });
    }
    
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET /analytics/streams
 * Soporta paginación con parámetros first y after
 */
export async function getStreams(req, res) {
  try {
    // Limitar first a máximo 100 según límites de Twitch
    const first = Math.min(req.query.first || 20, 100);
    const after = req.query.after || '';

    const url = `https://api.twitch.tv/helix/streams?first=${first}${after ? `&after=${after}` : ''}`;
    const data = await twitchGet(url);

    const streams = data.data.map(stream => ({
      title: stream.title,
      user_name: stream.user_name
    }));

    // Devuelve también el cursor para la siguiente página
    return res.status(200).json({
      data: streams,
      pagination: data.pagination || {}
    });
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    }
    
    // Manejar rate limits de Twitch
    if (err.response?.status === 429) {
      const retryAfter = err.response.headers['ratelimit-reset'];
      return res.status(429).json({ 
        error: "Too many requests. Please try again later.",
        retry_after: retryAfter 
      });
    }
    
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
