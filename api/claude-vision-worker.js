/**
 * Cloudflare Workers - Claude Vision API Proxy
 *
 * 배포 방법:
 * 1. https://dash.cloudflare.com 접속
 * 2. Workers & Pages > Create Application > Create Worker
 * 3. 이 코드를 붙여넣기
 * 4. Settings > Variables에서 ANTHROPIC_API_KEY 환경변수 추가
 * 5. Deploy
 */

export default {
  async fetch(request, env) {
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST 요청만 허용
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { imageBase64, productName } = await request.json();

      if (!imageBase64) {
        return new Response(JSON.stringify({ error: 'Image data required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Base64 데이터에서 prefix 제거
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // 이미지 타입 추출
      const mediaTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mediaType = mediaTypeMatch ? mediaTypeMatch[1] : 'image/png';

      // Claude API 호출
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data
                  }
                },
                {
                  type: 'text',
                  text: `이 이미지는 "${productName || '상품'}" 상세페이지의 일부입니다.

이미지에서 제품의 핵심 소구점(판매 포인트)을 분석해주세요.

다음 형식으로 응답해주세요:
1. 핵심 소구점 (2~3개, 각 20자 이내)
2. 타겟 고객층
3. 추천 마케팅 메시지 (30자 이내)

JSON 형식으로 응답:
{
  "sellingPoints": ["소구점1", "소구점2", "소구점3"],
  "targetAudience": "타겟 고객층",
  "marketingMessage": "마케팅 메시지",
  "extractedText": "이미지에서 읽은 주요 텍스트"
}`
                }
              ]
            }
          ]
        })
      });

      if (!claudeResponse.ok) {
        const errorData = await claudeResponse.text();
        console.error('Claude API Error:', errorData);
        return new Response(JSON.stringify({
          error: 'Claude API error',
          details: errorData
        }), {
          status: claudeResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const claudeData = await claudeResponse.json();

      // Claude 응답에서 텍스트 추출
      const responseText = claudeData.content?.[0]?.text || '';

      // JSON 파싱 시도
      let analysisResult;
      try {
        // JSON 블록 추출
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = {
            sellingPoints: [],
            targetAudience: '',
            marketingMessage: '',
            extractedText: responseText,
            raw: responseText
          };
        }
      } catch (parseError) {
        analysisResult = {
          sellingPoints: [],
          targetAudience: '',
          marketingMessage: '',
          extractedText: responseText,
          raw: responseText
        };
      }

      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        usage: claudeData.usage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
