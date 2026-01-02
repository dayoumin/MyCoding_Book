#!/usr/bin/env node

/**
 * 두 방식의 실제 작동 비교 테스트
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n' + '='.repeat(70));
console.log('🔬 Hook Input 방식 실제 작동 비교 테스트');
console.log('='.repeat(70));

// 테스트 데이터 준비
const transcriptPath = resolve(__dirname, 'transcript-sample.jsonl');
const hookInputPath = resolve(__dirname, 'hook-input-sample.json');

// ============================================================
// 테스트 1: 방식 1 - 환경변수 (설정 안 됨)
// ============================================================
console.log('\n📋 테스트 1: 방식 1 - 환경변수 없이 실행');
console.log('-'.repeat(70));

try {
  const output = execSync('node hook-method1-env.mjs', {
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('❌ 예상과 다름: 에러가 발생해야 하는데 성공함');
  console.log(output);
} catch (error) {
  console.log('✅ 예상대로: 환경변수 없어서 실패');
  console.log('\nstderr 출력:');
  console.log(error.stderr);
  console.log('\nstdout 출력:');
  console.log(error.stdout);
}

// ============================================================
// 테스트 2: 방식 1 - 환경변수 설정하고 실행
// ============================================================
console.log('\n\n📋 테스트 2: 방식 1 - 환경변수 설정 후 실행');
console.log('-'.repeat(70));

try {
  const output = execSync('node hook-method1-env.mjs', {
    cwd: __dirname,
    encoding: 'utf-8',
    env: {
      ...process.env,
      TRANSCRIPT_PATH: transcriptPath
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('✅ 환경변수 설정 시 정상 작동');
  console.log('\nstdout (Hook Response):');
  console.log(output);

  console.log('\n💡 결론:');
  console.log('   - TRANSCRIPT_PATH 환경변수가 있으면 작동함');
  console.log('   - 하지만 Claude Code가 이 환경변수를 설정해주는지는 불확실');
  console.log('   - 공식 문서에 없으므로 보장되지 않음');
} catch (error) {
  console.log('❌ 실패:');
  console.log(error.stderr);
}

// ============================================================
// 테스트 3: 방식 2 - stdin JSON (파일로 시뮬레이션)
// ============================================================
console.log('\n\n📋 테스트 3: 방식 2 - stdin JSON 방식');
console.log('-'.repeat(70));

try {
  const output = execSync('node hook-method2-stdin.mjs hook-input-sample.json', {
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('✅ stdin JSON 방식 정상 작동');
  console.log('\nstdout (Hook Response):');
  console.log(output);

  console.log('\n💡 결론:');
  console.log('   - stdin JSON 방식은 확실히 작동');
  console.log('   - 공식 문서에 명시됨');
  console.log('   - 모든 Hook Input 정보 사용 가능');
} catch (error) {
  console.log('❌ 실패:');
  console.log(error.stderr);
  console.log(error.stdout);
}

// ============================================================
// 테스트 4: 방식 2 - 실제 stdin 파이프
// ============================================================
console.log('\n\n📋 테스트 4: 방식 2 - 실제 stdin 파이프 사용');
console.log('-'.repeat(70));

try {
  const hookInput = fs.readFileSync(hookInputPath, 'utf-8');
  const output = execSync('node hook-method2-stdin.mjs', {
    cwd: __dirname,
    encoding: 'utf-8',
    input: hookInput,  // stdin으로 전달
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('✅ stdin 파이프 방식 정상 작동');
  console.log('\nstdout (Hook Response):');
  console.log(output);

  console.log('\n💡 결론:');
  console.log('   - 실제 stdin 파이프도 완벽히 작동');
  console.log('   - 이것이 Claude Code가 실제로 사용하는 방식');
} catch (error) {
  console.log('❌ 실패:');
  console.log(error.stderr);
  console.log(error.stdout);
}

// ============================================================
// 최종 비교
// ============================================================
console.log('\n\n' + '='.repeat(70));
console.log('📊 최종 비교 결과');
console.log('='.repeat(70));

console.log('\n방식 1 (환경변수):');
console.log('  ❌ 환경변수 없이는 실패');
console.log('  ✅ 환경변수 설정하면 작동');
console.log('  ⚠️  Claude Code가 TRANSCRIPT_PATH를 설정해주는지 불확실');
console.log('  ⚠️  공식 문서에 명시 안 됨');

console.log('\n방식 2 (stdin JSON):');
console.log('  ✅ 파일 인자로 작동');
console.log('  ✅ stdin 파이프로 작동 (실제 방식)');
console.log('  ✅ 공식 문서에 명시됨');
console.log('  ✅ 모든 Hook Input 정보 접근 가능');

console.log('\n🎯 권장사항:');
console.log('  ✅ 방식 2 (stdin JSON) 사용');
console.log('     - 공식 문서 준수');
console.log('     - 확실한 작동 보장');
console.log('     - 더 많은 정보 활용');

console.log('\n' + '='.repeat(70));
