/**
 * Cloudflare Workers - Solapi SMS API Proxy
 *
 * 배포 방법:
 * 1. https://dash.cloudflare.com 접속
 * 2. Workers & Pages > Create Application > Create Worker
 * 3. 이 코드를 붙여넣기
 * 4. Settings > Variables에서 환경변수 추가:
 *    - SOLAPI_API_KEY: Solapi API Key
 *    - SOLAPI_API_SECRET: Solapi API Secret
 *    - SOLAPI_SENDER: 등록된 발신번호 (예: 01012345678)
 * 5. Deploy
 *
 * Solapi 콘솔: https://console.solapi.com
 * API 문서: https://docs.solapi.com
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 발신번호 조회
      if (request.method === 'GET' && path === '/sender') {
        return jsonResponse({ sender: env.SOLAPI_SENDER || '' }, corsHeaders);
      }

      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, corsHeaders, 405);
      }

      const body = await request.json();

      // 단건 발송
      if (path === '/send') {
        return await handleSendMessage(body, env, corsHeaders);
      }

      // 대량 발송
      if (path === '/send-many') {
        return await handleSendMany(body, env, corsHeaders);
      }

      // 발송 내역 조회
      if (path === '/messages') {
        return await handleGetMessages(body, env, corsHeaders);
      }

      // 잔액 조회
      if (path === '/balance') {
        return await handleGetBalance(env, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, corsHeaders, 404);

    } catch (error) {
      console.error('Worker Error:', error);
      return jsonResponse({
        error: 'Internal server error',
        message: error.message
      }, corsHeaders, 500);
    }
  }
};

// HMAC-SHA256 서명 생성
async function generateSignature(apiSecret, date, salt) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const msgData = encoder.encode(date + salt);

  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 인증 헤더 생성
async function getAuthHeader(env) {
  const date = new Date().toISOString();
  const salt = crypto.randomUUID();
  const signature = await generateSignature(env.SOLAPI_API_SECRET, date, salt);

  return `HMAC-SHA256 apiKey=${env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
}

// 단건 메시지 발송
async function handleSendMessage(body, env, corsHeaders) {
  const { to, text, subject, type } = body;

  if (!to || !text) {
    return jsonResponse({ error: '수신번호(to)와 내용(text)은 필수입니다.' }, corsHeaders, 400);
  }

  const cleanTo = to.replace(/[^0-9]/g, '');
  const sender = env.SOLAPI_SENDER;

  if (!sender) {
    return jsonResponse({ error: '발신번호가 설정되지 않았습니다. Worker 환경변수를 확인하세요.' }, corsHeaders, 500);
  }

  // 메시지 타입 결정: SMS(90바이트 이하), LMS(장문), MMS(이미지)
  const msgType = type || (new Blob([text]).size > 90 ? 'LMS' : 'SMS');

  const messageData = {
    message: {
      to: cleanTo,
      from: sender,
      text: text,
      type: msgType
    }
  };

  if (subject && msgType !== 'SMS') {
    messageData.message.subject = subject;
  }

  const auth = await getAuthHeader(env);

  const response = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    body: JSON.stringify(messageData)
  });

  const result = await response.json();

  if (!response.ok) {
    return jsonResponse({
      error: 'Solapi API 오류',
      details: result
    }, corsHeaders, response.status);
  }

  return jsonResponse({
    success: true,
    result: result,
    messageType: msgType
  }, corsHeaders);
}

// 대량 메시지 발송
async function handleSendMany(body, env, corsHeaders) {
  const { messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: 'messages 배열이 필요합니다.' }, corsHeaders, 400);
  }

  const sender = env.SOLAPI_SENDER;
  if (!sender) {
    return jsonResponse({ error: '발신번호가 설정되지 않았습니다.' }, corsHeaders, 500);
  }

  const formattedMessages = messages.map(msg => {
    const cleanTo = msg.to.replace(/[^0-9]/g, '');
    const msgType = msg.type || (new Blob([msg.text]).size > 90 ? 'LMS' : 'SMS');
    const messageObj = {
      to: cleanTo,
      from: sender,
      text: msg.text,
      type: msgType
    };
    if (msg.subject && msgType !== 'SMS') {
      messageObj.subject = msg.subject;
    }
    return messageObj;
  });

  const auth = await getAuthHeader(env);

  const response = await fetch('https://api.solapi.com/messages/v4/send-many', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    body: JSON.stringify({ messages: formattedMessages })
  });

  const result = await response.json();

  if (!response.ok) {
    return jsonResponse({
      error: 'Solapi API 오류',
      details: result
    }, corsHeaders, response.status);
  }

  return jsonResponse({
    success: true,
    result: result,
    totalSent: formattedMessages.length
  }, corsHeaders);
}

// 발송 내역 조회
async function handleGetMessages(body, env, corsHeaders) {
  const auth = await getAuthHeader(env);
  const params = new URLSearchParams();

  if (body.startDate) params.append('startDate', body.startDate);
  if (body.endDate) params.append('endDate', body.endDate);
  if (body.limit) params.append('limit', body.limit);
  if (body.offset) params.append('offset', body.offset);

  const response = await fetch(`https://api.solapi.com/messages/v4/list?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': auth
    }
  });

  const result = await response.json();
  return jsonResponse(result, corsHeaders, response.ok ? 200 : response.status);
}

// 잔액 조회
async function handleGetBalance(env, corsHeaders) {
  const auth = await getAuthHeader(env);

  const response = await fetch('https://api.solapi.com/cash/v1/balance', {
    method: 'GET',
    headers: {
      'Authorization': auth
    }
  });

  const result = await response.json();
  return jsonResponse(result, corsHeaders, response.ok ? 200 : response.status);
}

// JSON 응답 헬퍼
function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
