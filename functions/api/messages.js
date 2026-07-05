// 留言板 API — Cloudflare Pages Functions
// GET  /api/messages  — 获取所有留言
// POST /api/messages  — 提交新留言

export async function onRequest(context) {
  const { request, env } = context;

  // CORS 头（允许前端跨域请求）
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ===== 获取留言 =====
  if (request.method === 'GET') {
    try {
      const messages = await env.GUESTBOOK.get('messages', 'json') || [];
      return new Response(JSON.stringify(messages), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // ===== 提交留言 =====
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { name, content } = body;

      // 校验
      if (!name || !content || name.trim() === '' || content.trim() === '') {
        return new Response(JSON.stringify({ error: '请填写昵称和留言内容' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (name.trim().length > 20) {
        return new Response(JSON.stringify({ error: '昵称不能超过20个字符' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      if (content.trim().length > 500) {
        return new Response(JSON.stringify({ error: '留言内容不能超过500个字符' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 读取已有留言
      const messages = await env.GUESTBOOK.get('messages', 'json') || [];

      // 新留言
      const newMessage = {
        id: Date.now().toString(),
        name: name.trim(),
        content: content.trim(),
        time: new Date().toLocaleString('zh-CN'),
        timestamp: Date.now(),
      };

      messages.unshift(newMessage);

      // 保留最近 100 条
      if (messages.length > 100) {
        messages.length = 100;
      }

      await env.GUESTBOOK.put('messages', JSON.stringify(messages));

      return new Response(JSON.stringify(newMessage), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: '提交失败，请稍后重试' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
