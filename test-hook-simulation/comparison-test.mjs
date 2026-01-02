#!/usr/bin/env node

/**
 * 두 가지 Hook Input 읽기 방식 비교
 *
 * 방식 1 (수정 전): process.env.TRANSCRIPT_PATH
 * 방식 2 (수정 후): hookInput.transcript_path from stdin
 */

import fs from 'fs';

console.log('='.repeat(60));
console.log('Hook Input 읽기 방식 비교 테스트');
console.log('='.repeat(60));

// ============================================================
// 방식 1: 환경변수 사용 (수정 전)
// ============================================================
console.log('\n📋 방식 1: process.env.TRANSCRIPT_PATH');
console.log('-'.repeat(60));

const method1Code = `
// Hook 스크립트
const transcriptPath = process.env.TRANSCRIPT_PATH;
const transcript = fs.readFileSync(transcriptPath, 'utf-8');
`;

console.log('코드:', method1Code);

console.log('\n장점:');
console.log('  ✅ 간단하고 직관적');
console.log('  ✅ 한 줄로 끝');
console.log('  ✅ 다른 언어(Bash, Python)에서도 동일 패턴');

console.log('\n단점:');
console.log('  ❌ 공식 문서에 명시되지 않음');
console.log('  ❌ 환경변수가 실제로 설정되는지 불확실');
console.log('  ❌ 다른 Hook Input 정보 접근 불가 (tool_name, session_id 등)');

console.log('\n실제 작동 여부:');
console.log('  ❓ 공식 문서에 없으므로 실제 환경에서 작동하지 않을 가능성 높음');
console.log('  ❓ Claude Code가 TRANSCRIPT_PATH 환경변수를 설정해주지 않음');

// ============================================================
// 방식 2: stdin JSON 파싱 (수정 후)
// ============================================================
console.log('\n\n📋 방식 2: hookInput.transcript_path from stdin');
console.log('-'.repeat(60));

const method2Code = `
// Hook 스크립트
const hookInput = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
const transcriptPath = hookInput.transcript_path;
const transcript = fs.readFileSync(transcriptPath, 'utf-8');

// 추가 정보도 사용 가능
console.log('Tool:', hookInput.tool_name);
console.log('Session:', hookInput.session_id);
`;

console.log('코드:', method2Code);

console.log('\n장점:');
console.log('  ✅ 공식 문서에 명시됨 (hooks.md)');
console.log('  ✅ 모든 Hook Input 정보 접근 가능');
console.log('  ✅ tool_name, tool_input, tool_output 등 활용 가능');
console.log('  ✅ 실제 환경에서 확실히 작동');

console.log('\n단점:');
console.log('  ❌ 코드가 약간 더 김 (3줄)');
console.log('  ❌ JSON 파싱 오버헤드 (미미함)');
console.log('  ❌ /dev/stdin은 Unix 전용 (Windows에서는 다른 방법 필요)');

console.log('\n실제 작동 여부:');
console.log('  ✅ 공식 문서 명시: "Hook receives JSON via stdin"');
console.log('  ✅ 예제 코드에서 확인됨');

// ============================================================
// 비교 시뮬레이션
// ============================================================
console.log('\n\n🧪 시뮬레이션 비교');
console.log('='.repeat(60));

// 방식 1 시뮬레이션
console.log('\n[방식 1] 환경변수 시뮬레이션:');
const fakeEnv = {
  TRANSCRIPT_PATH: 'test-hook-simulation/transcript-sample.jsonl'
};

try {
  // 실제로 환경변수가 있다고 가정
  const path1 = fakeEnv.TRANSCRIPT_PATH;

  if (path1) {
    console.log(`  ✅ TRANSCRIPT_PATH 읽기 성공: ${path1}`);

    if (fs.existsSync(path1)) {
      const content = fs.readFileSync(path1, 'utf-8');
      console.log(`  ✅ Transcript 파일 읽기 성공 (${content.split('\n').length} lines)`);
    }
  } else {
    console.log('  ❌ TRANSCRIPT_PATH 환경변수 없음');
  }

  console.log('\n  ⚠️  하지만 실제 Claude Code 환경에서는:');
  console.log('     - TRANSCRIPT_PATH 환경변수를 설정해주지 않을 가능성 높음');
  console.log('     - 공식 문서에 명시되지 않았으므로 보장되지 않음');

} catch (err) {
  console.log(`  ❌ 에러: ${err.message}`);
}

// 방식 2 시뮬레이션
console.log('\n[방식 2] stdin JSON 시뮬레이션:');
try {
  const hookInputPath = 'test-hook-simulation/hook-input-sample.json';
  const hookInput = JSON.parse(fs.readFileSync(hookInputPath, 'utf-8'));

  console.log(`  ✅ Hook Input 읽기 성공`);
  console.log(`     - session_id: ${hookInput.session_id}`);
  console.log(`     - tool_name: ${hookInput.tool_name}`);
  console.log(`     - transcript_path: ${hookInput.transcript_path}`);

  const transcriptPath = hookInput.transcript_path;

  if (fs.existsSync(transcriptPath)) {
    const content = fs.readFileSync(transcriptPath, 'utf-8');
    console.log(`  ✅ Transcript 파일 읽기 성공 (${content.split('\n').length} lines)`);
  }

  console.log('\n  ✅ 추가 정보 활용 가능:');
  console.log(`     - Tool Input: ${JSON.stringify(hookInput.tool_input)}`);
  console.log(`     - Tool Output: ${hookInput.tool_output}`);
  console.log(`     - Project Dir: ${hookInput.project_dir}`);

} catch (err) {
  console.log(`  ❌ 에러: ${err.message}`);
}

// ============================================================
// 결론
// ============================================================
console.log('\n\n🎯 결론');
console.log('='.repeat(60));

console.log('\n1️⃣  간편함 측면:');
console.log('   🥇 방식 1 (환경변수) - 코드 1줄');
console.log('   🥈 방식 2 (stdin) - 코드 3줄');

console.log('\n2️⃣  원칙 (공식 문서 준수) 측면:');
console.log('   🥇 방식 2 (stdin) - 공식 문서에 명시됨');
console.log('   🥉 방식 1 (환경변수) - 공식 문서에 없음');

console.log('\n3️⃣  실제 작동 가능성:');
console.log('   🥇 방식 2 (stdin) - 확실히 작동');
console.log('   ❓ 방식 1 (환경변수) - 작동 보장 안됨');

console.log('\n4️⃣  확장성:');
console.log('   🥇 방식 2 (stdin) - 모든 Hook Input 정보 사용 가능');
console.log('   🥉 방식 1 (환경변수) - transcript_path만 접근 가능');

console.log('\n📌 최종 권장사항:');
console.log('   ✅ 프로덕션: 방식 2 (stdin JSON) 사용');
console.log('      이유: 공식 문서 준수, 확실한 작동, 풍부한 정보');
console.log('   ');
console.log('   ⚠️  방식 1은 "간편해 보이지만" 실제로는:');
console.log('      - Claude Code가 환경변수를 설정해주지 않을 수 있음');
console.log('      - 공식 문서에 없으므로 향후 변경 가능');
console.log('      - 디버깅 시 다른 정보 접근 불가');

console.log('\n💡 절충안:');
console.log('   Helper 함수를 만들어서 간편하게 사용:');

const helperCode = `
// utils.mjs
export function getHookInput() {
  return JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
}

// my-hook.mjs
import { getHookInput } from './utils.mjs';

const input = getHookInput();
const transcript = fs.readFileSync(input.transcript_path, 'utf-8');
`;

console.log(helperCode);

console.log('\n이렇게 하면:');
console.log('  ✅ 간편함 유지 (한 줄로 input 가져오기)');
console.log('  ✅ 공식 문서 준수');
console.log('  ✅ 모든 정보 접근 가능');

console.log('\n' + '='.repeat(60));
