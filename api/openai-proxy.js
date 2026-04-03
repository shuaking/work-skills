/**
 * Vercel Serverless Function - OpenAI API 代理
 *
 * 功能：
 * - 代理前端请求到 OpenAI API
 * - 处理 CORS 跨域问题
 * - 保护 API Key 安全（可选：使用环境变量）
 */

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 GET 和 POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 从请求头获取 API Key
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { message: 'Missing or invalid Authorization header' }
      });
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // 从请求体获取目标端点
    let targetEndpoint = '/chat/completions';
    let requestBody = null;

    if (req.method === 'POST') {
      const { endpoint, ...body } = req.body;
      if (endpoint) {
        targetEndpoint = endpoint;
      }
      requestBody = body;
    } else if (req.method === 'GET') {
      // GET 请求用于获取模型列表
      targetEndpoint = '/models';
    }

    // 构建 OpenAI API URL
    const openaiUrl = `https://api.openai.com/v1${targetEndpoint}`;

    // 代理请求到 OpenAI
    const openaiResponse = await fetch(openaiUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined
    });

    // 获取响应数据
    const data = await openaiResponse.json();

    // 返回响应
    return res.status(openaiResponse.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error'
      }
    });
  }
}
