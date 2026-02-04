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
