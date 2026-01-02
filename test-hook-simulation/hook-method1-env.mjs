#!/usr/bin/env node

/**
 * 방식 1: 환경변수 사용 (수정 전)
 * process.env.TRANSCRIPT_PATH
 */

import fs from 'fs';

console.error('[방식 1] 환경변수 방식 테스트');
console.error('='.repeat(60));

try {
  // 환경변수에서 transcript_path 읽기
  const transcriptPath = process.env.TRANSCRIPT_PATH;

  console.error('1. 환경변수 확인:');
  console.error(`   TRANSCRIPT_PATH = ${transcriptPath || '(없음)'}`);

  if (!transcriptPath) {
    throw new Error('TRANSCRIPT_PATH 환경변수가 설정되지 않았습니다');
  }

  console.error('\n2. Transcript 파일 읽기:');
  const transcript = fs.readFileSync(transcriptPath, 'utf-8');
  console.error(`   ✅ 파일 읽기 성공 (${transcript.length} bytes)`);

  // Agent 파싱
  const lines = transcript.trim().split('\n');
  const agents = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'tool_use' && entry.tool === 'Task') {
        agents.push(entry.input?.subagent_type);
      }
    } catch (e) {
      // Skip invalid lines
    }
  }

  console.error(`\n3. Agent 이력 파싱:`);
  console.error(`   감지된 Agents: ${JSON.stringify(agents)}`);

  // 분기 로직
  if (agents.includes('content-creator') && !agents.includes('content-auditor')) {
    const response = {
      decision: 'block',
      reason: 'content-auditor 호출 필요'
    };
    console.log(JSON.stringify(response, null, 2));
    console.error('\n✅ 방식 1 성공: decision block 반환');
    process.exit(0);
  } else {
    const response = {
      decision: 'approve',
      reason: 'OK'
    };
    console.log(JSON.stringify(response, null, 2));
    console.error('\n✅ 방식 1 성공: decision approve 반환');
    process.exit(0);
  }

} catch (error) {
  console.error(`\n❌ 방식 1 실패: ${error.message}`);
  console.error('\n원인:');
  console.error('  - TRANSCRIPT_PATH 환경변수가 설정되지 않음');
  console.error('  - 이 환경변수는 공식 문서에 없음');
  console.error('  - Claude Code가 자동으로 설정해주지 않음');

  const errorResponse = {
    decision: 'approve',
    reason: 'Hook 실행 실패 - 환경변수 없음'
  };
  console.log(JSON.stringify(errorResponse, null, 2));

  process.exit(2);  // Hook 에러
}
