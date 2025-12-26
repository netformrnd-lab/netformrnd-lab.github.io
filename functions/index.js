const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

/**
 * 카페24 OAuth 토큰 프록시
 * 브라우저 CORS 문제를 우회하기 위한 서버 프록시
 */
exports.cafe24OAuthToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // POST 요청만 허용
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { mallId, code, redirectUri, clientId, clientSecret, grantType, refreshToken } = req.body;

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
});
