export const PASSWORD_RULE_MESSAGE = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다";

export function isValidPassword(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}
