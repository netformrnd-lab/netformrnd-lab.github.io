const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { SolapiMessageService } = require('solapi');

const app = express();

// 솔라피 SMS 서비스 초기화 (환경변수에서 API 키 가져오기)
const solapiService = new SolapiMessageService(
  process.env.SOLAPI_API_KEY || '',
  process.env.SOLAPI_API_SECRET || ''
);

// CORS 및 JSON 파싱 설정
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * 카페24 OAuth 토큰 및 API 프록시
 * 브라우저 CORS 문제를 우회하기 위한 서버 프록시
 *
 * 1. OAuth 토큰 발급/갱신: grantType 파라미터 사용
 * 2. API 호출: apiEndpoint + accessToken 파라미터 사용
 */
app.post('/', async (req, res) => {
  try {
    const { mallId, code, redirectUri, clientId, clientSecret, grantType, refreshToken, apiEndpoint, accessToken } = req.body;

    // ==================== API 프록시 모드 ====================
    // apiEndpoint가 있으면 카페24 API 호출 (주문 조회 등)
    if (apiEndpoint && accessToken) {
      if (!mallId) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'mallId is required for API calls'
        });
      }

      const apiUrl = `https://${mallId}.cafe24api.com${apiEndpoint}`;
      console.log('Calling Cafe24 API:', apiUrl);

      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': '2025-12-01'
        }
      });

      const apiData = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error('Cafe24 API error:', apiData);
        return res.status(apiResponse.status).json(apiData);
      }

      console.log('API call successful, orders count:', apiData.orders?.length || 0);
      return res.status(200).json(apiData);
    }

    // ==================== OAuth 토큰 모드 ====================
    // 필수 파라미터 검증
    if (!mallId || !clientId || !clientSecret) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'mallId, clientId, clientSecret are required'
      });
    }

    // Basic Auth 헤더 생성
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 요청 본문 구성
    let body;
    if (grantType === 'refresh_token') {
      // 토큰 갱신
      if (!refreshToken) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'refreshToken is required for refresh_token grant'
        });
      }
      body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`;
    } else {
      // 인증 코드로 토큰 발급
      if (!code || !redirectUri) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'code and redirectUri are required for authorization_code grant'
        });
      }
      body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }

    // 카페24 토큰 API 호출
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;
    console.log('Requesting token from:', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cafe24 token error:', data);
      return res.status(response.status).json(data);
    }

    console.log('Token issued successfully for mall:', mallId);
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: error.message
    });
  }
});

/**
 * ==================== 솔라피 SMS 발송 API ====================
 * POST /sms
 *
 * 요청 본문:
 * {
 *   "to": "01012345678",       // 수신번호 (필수)
 *   "text": "메시지 내용",      // 메시지 내용 (필수)
 *   "from": "01012345678"      // 발신번호 (선택, 환경변수 기본값 사용)
 * }
 *
 * 환경변수:
 * - SOLAPI_API_KEY: 솔라피 API 키
 * - SOLAPI_API_SECRET: 솔라피 API 시크릿
 * - SOLAPI_SENDER_NUMBER: 기본 발신번호
 */
app.post('/sms', async (req, res) => {
  try {
    const { to, text, from } = req.body;

    // 필수 파라미터 검증
    if (!to || !text) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'to(수신번호)와 text(메시지 내용)는 필수입니다.'
      });
    }

    // API 키 검증
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'config_error',
        message: '솔라피 API 키가 설정되지 않았습니다.'
      });
    }

    // 발신번호 설정 (파라미터 > 환경변수)
    const senderNumber = from || process.env.SOLAPI_SENDER_NUMBER;
    if (!senderNumber) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: '발신번호(from)가 필요합니다.'
      });
    }

    // 전화번호 정규화 (하이픈 제거)
    const cleanTo = to.replace(/-/g, '');
    const cleanFrom = senderNumber.replace(/-/g, '');

    console.log(`SMS 발송 시도: ${cleanFrom} -> ${cleanTo}`);

    // 솔라피 SMS 발송
    const result = await solapiService.send({
      to: cleanTo,
      from: cleanFrom,
      text: text
    });

    console.log('SMS 발송 성공:', result);

    return res.status(200).json({
      success: true,
      message: 'SMS 발송 성공',
      data: {
        messageId: result.groupId || result.messageId,
        to: cleanTo,
        status: result.statusCode || 'SENT'
      }
    });

  } catch (error) {
    console.error('SMS 발송 실패:', error);

    return res.status(500).json({
      success: false,
      error: 'send_failed',
      message: error.message || 'SMS 발송 중 오류가 발생했습니다.',
      details: error.data || null
    });
  }
});

/**
 * 대량 SMS 발송 API
 * POST /sms/bulk
 *
 * 요청 본문:
 * {
 *   "messages": [
 *     { "to": "01012345678", "text": "메시지1" },
 *     { "to": "01087654321", "text": "메시지2" }
 *   ],
 *   "from": "01012345678"  // 공통 발신번호 (선택)
 * }
 */
app.post('/sms/bulk', async (req, res) => {
  try {
    const { messages, from } = req.body;

    // 필수 파라미터 검증
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'messages 배열이 필요합니다.'
      });
    }

    // API 키 검증
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'config_error',
        message: '솔라피 API 키가 설정되지 않았습니다.'
      });
    }

    const senderNumber = from || process.env.SOLAPI_SENDER_NUMBER;
    if (!senderNumber) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: '발신번호(from)가 필요합니다.'
      });
    }

    const cleanFrom = senderNumber.replace(/-/g, '');

    // 메시지 배열 정규화
    const normalizedMessages = messages.map(msg => ({
      to: msg.to.replace(/-/g, ''),
      from: cleanFrom,
      text: msg.text
    }));

    console.log(`대량 SMS 발송 시도: ${normalizedMessages.length}건`);

    // 솔라피 대량 발송
    const result = await solapiService.send(normalizedMessages);

    console.log('대량 SMS 발송 성공:', result);

    return res.status(200).json({
      success: true,
      message: `${normalizedMessages.length}건 SMS 발송 성공`,
      data: {
        groupId: result.groupId,
        count: normalizedMessages.length,
        status: result.statusCode || 'SENT'
      }
    });

  } catch (error) {
    console.error('대량 SMS 발송 실패:', error);

    return res.status(500).json({
      success: false,
      error: 'send_failed',
      message: error.message || '대량 SMS 발송 중 오류가 발생했습니다.',
      details: error.data || null
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'moyeora-api-proxy',
    features: ['cafe24-oauth', 'solapi-sms']
  });
});

// Cloud Run은 PORT 환경변수를 사용
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
