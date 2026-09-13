export default {
  async fetch(request, env) {
    const allowedOrigin = 'https://jkharris27.github.io';
    const origin = request.headers.get('Origin') || '';

    const cors = {
      'Access-Control-Allow-Origin': origin === allowedOrigin ? allowedOrigin : allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405, headers: cors });
    }

    try {
      const body = await request.json();
      const reference = String(body.reference || '').trim();
      const esv = String(body.esv || '').trim();
      const nlt = String(body.nlt || '').trim();
      const msg = String(body.msg || '').trim();
      const common = String(body.commonCommentary || '').trim();
      const sda = String(body.sdaCommentary || '').trim();

      if (!reference || !esv) {
        return Response.json({ error: 'reference and esv are required' }, { status: 400, headers: cors });
      }

      const system = `You write a short Bible-study commentary for a verse-study app. Be broadly consistent with a balanced, mainstream Seventh-day Adventist perspective, neither rigidly conservative nor revisionist/liberal. Scripture is primary. Do not invent historical facts, Greek/Hebrew claims, Ellen G. White quotations, SDA Bible Commentary quotations, or doctrinal claims. If the supplied source material does not support a point, do not present it as sourced fact. Keep the tone pastoral, thoughtful, and concise. Explain the verse in context and give one practical spiritual takeaway. Avoid denominational jargon unless directly relevant. Do not attack other Christian traditions. Output plain text only, about 120-180 words.`;

      const user = [
        `Verse: ${reference}`,
        `ESV: ${esv}`,
        nlt ? `NLT: ${nlt}` : '',
        msg ? `MSG: ${msg}` : '',
        common ? `Matthew Henry Concise excerpt: ${common.slice(0, 3500)}` : '',
        sda ? `SDA Bible Commentary excerpt: ${sda.slice(0, 3500)}` : '',
        '',
        'Write the commentary now.'
      ].filter(Boolean).join('\n');

      const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 320,
        temperature: 0.35
      });

      const text = String(result?.response || result?.result?.response || '').trim();
      if (!text) throw new Error('Empty model response');

      return Response.json({ commentary: text }, {
        headers: {
          ...cors,
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } catch (error) {
      return Response.json({ error: 'AI commentary could not be generated.' }, { status: 500, headers: cors });
    }
  }
};
