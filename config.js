/**
 * Nature Green Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 * 이미지는 설정이 필요 없습니다. 아래 폴더에 순번 파일명으로 넣으면 자동 감지됩니다.
 *
 * 이미지 폴더 구조 (파일명 규칙):
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/story/1.jpg, 2.jpg, ...  - 스토리 사진들 (순번, 자동 감지)
 *   images/gallery/1.jpg, 2.jpg, ... - 갤러리 사진들 (순번, 자동 감지)
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 */

const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: true,  // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 메인 (히어로) ──
  groom: {
    name: "전종원",
    nameEn: "Groom",
    father: "전상주",       // ← 신랑 아버지 성함으로 수정해주세요
    mother: "양희선",       // ← 신랑 어머니 성함으로 수정해주세요
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "정아라",
    nameEn: "Bride",
    father: "정민규",
    mother: "구진희",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-06-13",
    time: "13:40",
    venue: "그랜드머큐어앰버서더 창원 (구 풀만호텔)",
    hall: "2층 그랜드 볼룸",
    address: "경상남도 창원시 의창구 원이대로 362",  // ← 그랜드머큐어앰버서더 창원 실제 주소
    tel: "055-600-0800",
    mapLinks: {
      kakao: "https://map.kakao.com/link/search/그랜드머큐어앰버서더창원",
      naver: "https://map.naver.com/v5/search/그랜드머큐어앰버서더창원"
    }
  },

  // ── 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content: "푸르른 6월의 어느날,\n서로의 봄이 되어주던 두 사람이\n이제는 빛나는 여름을 바라보며\n서로의 손을 잡고 한 길을 걸어가려 합니다.\n설레는 첫걸음의 순간에\n따뜻한 마음으로 함께 해주시면 감사하겠습니다."
  },

  // ── 오시는 길 ──
  // (mapLinks와 캘린더는 location 섹션 내에 포함)

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "신랑", name: "전종원", bank: "국민은행", number: "842402-02-204356" },
      { role: "아버지", name: "전상주", bank: "경남은행", number: "603-22-0224031" },
      { role: "어머니", name: "양희선", bank: "경남은행", number: "528-22-0165548" }
    ],
    bride: [
      { role: "신부", name: "정아라", bank: "카카오뱅크", number: "3333-02-1757061" },
      { role: "아버지", name: "정민규", bank: "경남은행", number: "592-21-0201020" },
      { role: "어머니", name: "구진희", bank: "경남은행", number: "646-22-0149391" }
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "전종원 ♥ 정아라 결혼합니다",
    description: "2026년 6월 13일, 소중한 분들을 초대합니다."
  }
};