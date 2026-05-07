// ============================================================
// Design Philosophy: Precision Engineering
// - 비밀번호 강도 측정 유틸리티
// - 명확한 피드백으로 사용자 보안 강화
// ============================================================

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: number; // 0-4
  strength: PasswordStrength;
  label: string;
  color: string;
  suggestions: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return { score: 0, strength: 'weak', label: '', color: '', suggestions: [] };
  }

  // 길이 체크
  if (password.length >= 8) score++;
  else suggestions.push('8자 이상 입력하세요');

  if (password.length >= 12) score++;

  // 대문자 포함
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('대문자를 포함하세요');

  // 숫자 포함
  if (/[0-9]/.test(password)) score++;
  else suggestions.push('숫자를 포함하세요');

  // 특수문자 포함
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('특수문자를 포함하세요 (!@#$%)');

  // 소문자 포함
  if (/[a-z]/.test(password)) score++;

  // 최종 점수 정규화 (0-4)
  const normalizedScore = Math.min(4, Math.floor(score * 4 / 6));

  const strengthMap: Record<number, { strength: PasswordStrength; label: string; color: string }> = {
    0: { strength: 'weak', label: '매우 약함', color: '#EF4444' },
    1: { strength: 'weak', label: '약함', color: '#EF4444' },
    2: { strength: 'fair', label: '보통', color: '#F59E0B' },
    3: { strength: 'good', label: '강함', color: '#10B981' },
    4: { strength: 'strong', label: '매우 강함', color: '#0EA5E9' },
  };

  return {
    score: normalizedScore,
    ...strengthMap[normalizedScore],
    suggestions: suggestions.slice(0, 2),
  };
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
