const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// CORS 및 JSON 파싱 설정
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * 아임웹(Imweb) API 프록시
 * 브라우저 CORS 문제를 우회하기 위한 서버 프록시
 *
 * 1. 토큰 발급: API Key + Secret Key로 access_token 발급
 * 2. API 호출: 주문 조회, 상품 조회 등
 */
app.post('/imweb', async (req, res) => {
  try {
    const { apiKey, apiSecret, apiEndpoint, accessToken, method = 'GET', body } = req.body;

    // ==================== API 호출 모드 ====================
    // accessToken이 있으면 아임웹 API 호출
    if (apiEndpoint && accessToken) {
      const apiUrl = `https://api.imweb.me${apiEndpoint}`;
      console.log('Calling Imweb API:', apiUrl);

      const fetchOptions = {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const apiResponse = await fetch(apiUrl, fetchOptions);
      const apiData = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error('Imweb API error:', apiData);
        return res.status(apiResponse.status).json(apiData);
      }

      console.log('Imweb API call successful');
      return res.status(200).json(apiData);
    }

    // ==================== 토큰 발급 모드 ====================
    // apiKey와 apiSecret으로 access_token 발급
    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'apiKey and apiSecret are required'
      });
    }

    // 아임웹 토큰 발급 API 호출
    const tokenUrl = 'https://api.imweb.me/v2/auth';
    console.log('Requesting Imweb token');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'key': apiKey,
        'secret': apiSecret
      }
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.code !== 200) {
      console.error('Imweb token error:', tokenData);
      return res.status(tokenResponse.status).json(tokenData);
    }

    console.log('Imweb token issued successfully');
    return res.status(200).json(tokenData);

  } catch (error) {
    console.error('Imweb proxy error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: error.message
    });
  }
});

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

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ecommerce-api-proxy',
    endpoints: {
      cafe24: 'POST /',
      imweb: 'POST /imweb'
    }
  });
});

// Cloud Run은 PORT 환경변수를 사용
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
