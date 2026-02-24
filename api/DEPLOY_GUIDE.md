# Claude Vision API - Cloudflare Workers 배포 가이드

## 1. Cloudflare 계정 생성
https://dash.cloudflare.com 에서 무료 계정 생성

## 2. Worker 생성
1. 대시보드에서 **Workers & Pages** 클릭
2. **Create Application** 클릭
3. **Create Worker** 선택
4. 이름 입력: `claude-vision-api`
5. **Deploy** 클릭

## 3. 코드 붙여넣기
1. 생성된 Worker 클릭
2. **Edit code** 클릭
3. `claude-vision-worker.js` 파일 내용 전체 복사하여 붙여넣기
4. **Save and deploy** 클릭

## 4. 환경변수 설정 (중요!)
1. Worker 페이지에서 **Settings** 탭 클릭
2. **Variables** 섹션에서 **Add variable** 클릭
3. 다음 정보 입력:
   - Variable name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-xxxx...` (본인의 API 키)
4. **Encrypt** 체크 (보안을 위해 암호화)
5. **Save and deploy** 클릭

## 5. Worker URL 확인
배포 후 URL 확인 (예시):
```
https://claude-vision-api.YOUR_SUBDOMAIN.workers.dev
```

## 6. 프론트엔드 연동
`create.html`에서 `CLAUDE_VISION_API_URL` 값을 Worker URL로 변경

---

## 비용 안내
- Cloudflare Workers: **무료** (일 100,000 요청까지)
- Claude API: 이미지 1장 분석당 약 **$0.01~0.03**

## 보안 주의사항
- API 키는 절대 프론트엔드 코드에 직접 넣지 마세요
- Cloudflare Workers 환경변수에만 저장하세요
- ANTHROPIC_API_KEY는 반드시 암호화(Encrypt) 설정하세요

---

# Solapi SMS API - Cloudflare Workers 배포 가이드

## 1. Solapi 가입 및 API Key 발급
1. https://console.solapi.com 에서 가입
2. **발신번호** 등록 (본인 인증 필요)
3. **API Key** 메뉴에서 API Key와 API Secret 발급

## 2. Cloudflare Worker 생성
1. https://dash.cloudflare.com 에서 **Workers & Pages** > **Create Application**
2. **Create Worker** 선택
3. 이름 입력: `solapi-sms-api`
4. **Deploy** 클릭

## 3. 코드 붙여넣기
1. 생성된 Worker 클릭 > **Edit code**
2. `solapi-sms-worker.js` 파일 내용 전체 복사하여 붙여넣기
3. **Save and deploy** 클릭

## 4. 환경변수 설정 (중요!)
Worker 페이지에서 **Settings** > **Variables**에 아래 3개 추가:

| Variable name | Value | Encrypt |
|--------------|-------|---------|
| `SOLAPI_API_KEY` | Solapi에서 발급받은 API Key | Yes |
| `SOLAPI_API_SECRET` | Solapi에서 발급받은 API Secret | Yes |
| `SOLAPI_SENDER` | 등록된 발신번호 (예: 01012345678) | No |

## 5. CRM 센터에서 연동
1. CRM센터 > SMS 설정 탭 이동
2. Worker URL 입력 (예: `https://solapi-sms-api.YOUR_SUBDOMAIN.workers.dev`)
3. 연결 테스트 클릭하여 확인

## API 엔드포인트
| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/send` | POST | 단건 문자 발송 |
| `/send-many` | POST | 대량 문자 발송 |
| `/balance` | POST | 잔액 조회 |
| `/messages` | POST | 발송 내역 조회 |
| `/sender` | GET | 발신번호 조회 |

## 비용 안내
- Cloudflare Workers: **무료** (일 100,000 요청까지)
- Solapi SMS: **건당 약 9~20원** (SMS/LMS)
- Solapi 가입 시 무료 테스트 포인트 제공

## 보안 주의사항
- API Key/Secret은 절대 프론트엔드에 직접 넣지 마세요
- Cloudflare Workers 환경변수에만 저장하세요
- API Secret은 반드시 암호화(Encrypt) 설정하세요
