# 바꿀래

가진 것과 찾는 것을 등록하면, 서로 원하는 물건을 가진 사람끼리 이어 주는 물물교환 웹앱이에요.

| 역할 | 맡는 곳 |
| --- | --- |
| 화면 | GitHub Pages (정적 파일) |
| 회원가입, 로그인, 데이터, 실시간 반영 | Supabase |
| 지도 | 카카오맵 JavaScript SDK (방문자 브라우저에서 그림) |

키는 저장소에 올리지 않아요. GitHub Secrets에 넣어 두면, 배포할 때 `build.js`가 `src/index.html`의 `{{...}}` 자리에 채워 넣어요.

---

## 1. Supabase 준비 (10분)

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만들어요. 지역은 Seoul(Northeast Asia)을 추천해요.
2. **SQL Editor**에서 `supabase/schema.sql` 내용을 전부 붙여 넣고 **Run**을 눌러요.
3. (선택) 처음 화면이 비어 보이지 않게 하려면 `supabase/seed.sql`도 실행해요. 예시 이웃 4명과 물건 6개, 챌린지 1개가 들어가요.
4. **Authentication > URL Configuration**에서 아래처럼 설정해요.
   - Site URL: `https://내아이디.github.io/저장소이름/`
   - Redirect URLs: 위 주소와 `http://localhost:3000/`
5. **Authentication > Sign In / Providers > Email**에서 확인해요.
   - **Confirm email**이 켜져 있으면, 가입할 때 인증 메일의 링크를 눌러야 로그인돼요. 시연만 할 거라면 꺼 두면 바로 가입돼요.
6. **Project Settings > API**에서 두 값을 복사해 둬요.
   - Project URL → `SUPABASE_URL`
   - anon(public) 키 → `SUPABASE_ANON_KEY`

> **`service_role` 키는 절대 쓰지 마세요.** 이 키는 보안 규칙을 무시해요. 앱에는 anon 키만 넣어요.

## 2. 카카오맵 준비

1. [카카오 디벨로퍼스](https://developers.kakao.com)에서 앱을 만들고, 카카오맵 사용 설정을 **ON**으로 켜요.
2. **[앱] > [플랫폼 키] > [JavaScript 키]**에서 키를 복사해요. 이 값이 `KAKAO_JS_KEY`예요.
3. 같은 화면의 **JavaScript SDK 도메인**에 아래 두 주소를 등록해요. 저장소 이름 같은 경로는 빼고 도메인까지만 넣어요.
   - `https://내아이디.github.io`
   - `http://localhost:3000` (로컬 미리보기용. 다 쓰면 지워도 돼요)
   - **[제품 링크 관리]** 메뉴가 아니에요. 잘못 등록하면 `domain mismatched` 오류가 나요.

## 3. GitHub에 올리고 배포

1. 이 폴더를 GitHub 저장소로 올려요. `.env`와 `dist/`는 `.gitignore`에 들어 있어서 올라가지 않아요.
2. 저장소 **Settings > Secrets and variables > Actions > New repository secret**에서 세 개를 등록해요.
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `KAKAO_JS_KEY`
3. **Settings > Pages**의 Source를 **GitHub Actions**로 바꿔요.
4. `main` 브랜치에 push하면 자동으로 배포돼요. **Actions** 탭에서 진행 상황을 볼 수 있고, 다 끝나면 `https://내아이디.github.io/저장소이름/`에서 열려요.

## 로컬에서 미리보기

```bash
cp .env.example .env    # .env에 세 값을 넣어요
npm run dev             # http://localhost:3000
```

외부 패키지는 없어요. Node 18 이상만 있으면 돼요.

---

## 키가 노출되지 않나요?

배포된 페이지의 소스를 열면 `SUPABASE_ANON_KEY`와 `KAKAO_JS_KEY`는 보여요. 화면이 방문자 브라우저에서 동작하는 구조라 어떤 방식으로 배포해도 마찬가지예요. 두 키 모두 원래 공개되는 걸 전제로 만든 키이고, 다른 방법으로 보호돼요.

| 키 | 보호 방법 |
| --- | --- |
| 카카오 JavaScript 키 | 카카오에 등록한 도메인(`내아이디.github.io`)에서만 동작해요. 다른 사이트에 복사해 가도 지도가 뜨지 않아요. |
| Supabase anon 키 | `schema.sql`의 보안 규칙(Row Level Security)이 데이터베이스에서 직접 막아요. 아래 표 참고. |

저장소에는 키가 한 번도 들어가지 않아요. 그래서 커밋 기록에도 남지 않아요.

### 보안 규칙 (schema.sql)

- 프로필은 본인 것만 만들고 고칠 수 있어요. 닉네임은 겹칠 수 없어요.
- 물건은 주인만 등록, 수정, 삭제할 수 있어요. 교환이 진행 중인 물건은 삭제할 수 없어요.
- 교환 제안과 오픈채팅 링크는 당사자 두 명만 볼 수 있어요.
- 수락과 완료는 DB 함수(`accept_offer`, `complete_offer`)로만 처리돼요. 물건 상태 변경, 다른 제안 자동 거절, 교환 횟수, 챌린지 단계 추가가 한 번에 일어나요.
- 후기는 완료된 교환의 당사자만, 한 번씩 남길 수 있어요.
- 신고는 접수만 되고 앱에서는 아무도 볼 수 없어요. Supabase 대시보드의 `reports` 테이블에서 확인해요.

---

## 폴더 구조

```
src/index.html          화면 템플릿 ({{SUPABASE_URL}} 등 자리 표시)
src/app.js              화면과 동작 전부
src/style.css           디자인
src/geo.js              서울 구 경계 (카카오맵을 못 불러올 때 쓰는 간이 지도)
supabase/schema.sql     테이블, 보안 규칙, 함수, 실시간 설정
supabase/seed.sql       예시 데이터 (선택)
build.js                src → dist 복사 + 키 넣기 (+ 로컬 미리보기)
.github/workflows/      GitHub Pages 자동 배포
```

## 문제가 생기면

| 증상 | 확인할 것 |
| --- | --- |
| "설정이 필요해요" 화면이 떠요 | GitHub Secrets 이름과 값을 확인하고, Actions에서 다시 배포해요. |
| 지도가 간이 지도로 나와요 | 카카오 JavaScript SDK 도메인 등록, 카카오맵 사용 설정 ON, `KAKAO_JS_KEY` 값 |
| 가입했는데 로그인이 안 돼요 | 인증 메일의 링크를 눌렀는지 확인해요. 시연용이면 Confirm email을 꺼요. |
| 인증 메일 링크를 누르면 다른 주소로 가요 | Supabase의 Site URL과 Redirect URLs |
| 다른 사람의 변경이 바로 안 보여요 | `schema.sql`을 끝까지 실행했는지 확인해요 (실시간 설정이 마지막에 있어요). |
