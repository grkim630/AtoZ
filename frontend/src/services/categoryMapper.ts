/**
 * 프론트엔드 카테고리 이름 → 백엔드 PhoneCategory/MessageCategory 매핑
 * 
 * 기존 화면의 카테고리 이름을 백엔드 API가 요구하는 형식으로 변환합니다.
 */

import type {
  PhoneCategory,
  MessageCategory,
} from './phishingSimulationService';

/**
 * 전화 피싱 카테고리 매핑
 * 프론트엔드 표시명 → 백엔드 PhoneCategory
 */
export function mapPhoneCategory(
  frontendCategory: string,
): PhoneCategory | null {
  const mapping: Record<string, PhoneCategory> = {
    '경찰 사칭 전화': '검찰/경찰 사칭',
    '법원 사칭 전화': '검찰/경찰 사칭', // 법원도 검찰/경찰로 매핑
    '금융 사칭 전화': '금융기관 사칭',
    '자녀 사칭 전화': '자녀/지인 사칭',
    '택배 배송 전화': '택배/배송 사칭',
    '지인 사칭 전화': '자녀/지인 사칭',
    // 백엔드 카테고리 그대로도 허용
    '검찰/경찰 사칭': '검찰/경찰 사칭',
    '금융기관 사칭': '금융기관 사칭',
    '자녀/지인 사칭': '자녀/지인 사칭',
    '택배/배송 사칭': '택배/배송 사칭',
    '해외 송금/범죄 연루 사칭': '해외 송금/범죄 연루 사칭',
  };

  return mapping[frontendCategory] ?? null;
}

/**
 * 문자(메시지) 피싱 카테고리 매핑
 * 프론트엔드 표시명 → 백엔드 MessageCategory
 */
export function mapMessageCategory(
  frontendCategory: string,
): MessageCategory | null {
  const mapping: Record<string, MessageCategory> = {
    '로맨스스캠 메세지': '지인 사칭 링크', // 로맨스스캠은 지인 사칭으로 매핑
    '부업 피싱 메세지': '금융기관 알림', // 부업은 금융 알림으로 매핑
    'SNS 제안 메세지': '지인 사칭 링크',
    // 백엔드 카테고리 그대로도 허용
    '택배 문자': '택배 문자',
    '금융기관 알림': '금융기관 알림',
    '계정 정지/보안 경고': '계정 정지/보안 경고',
    '지인 사칭 링크': '지인 사칭 링크',
  };

  return mapping[frontendCategory] ?? null;
}

/**
 * 기본 전화 카테고리 (매핑 실패 시 fallback)
 */
export const DEFAULT_PHONE_CATEGORY: PhoneCategory = '검찰/경찰 사칭';

/**
 * 기본 메시지 카테고리 (매핑 실패 시 fallback)
 */
export const DEFAULT_MESSAGE_CATEGORY: MessageCategory = '택배 문자';
