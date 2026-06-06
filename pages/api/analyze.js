export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt, imagen, mediaType } = req.body;
  try {
    let imageData = imagen;
    let imageType = mediaType || 'image/jpeg';
    
    if (imageData && imageData.includes(',')) {
      imageData = imageData.split(',')[1];
    }
    
    const messages = imageData ? [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: imageType, data: imageData } },
        { type: 'text', text: prompt }
      ]
    }] : [{ role: 'user', content: prompt }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
