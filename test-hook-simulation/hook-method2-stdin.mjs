#!/usr/bin/env node

/**
 * 방식 2: stdin JSON 사용 (수정 후)
 * hookInput.transcript_path from stdin
 */

import fs from 'fs';

console.error('[방식 2] stdin JSON 방식 테스트');
console.error('='.repeat(60));

try {
  // stdin에서 Hook Input JSON 읽기
  console.error('1. stdin에서 Hook Input 읽기:');

  let stdinInput = '';

  // 테스트 모드: 인자가 있으면 파일에서 읽기
  const args = process.argv.slice(2);
  if (args.length > 0) {
    stdinInput = fs.readFileSync(args[0], 'utf-8');
    console.error(`   테스트 모드: ${args[0]} 파일에서 읽기`);
  } else {
    // 실제 모드: stdin에서 읽기
    stdinInput = fs.readFileSync(0, 'utf-8');  // 0 = stdin (Windows 호환)
    console.error('   실제 모드: stdin에서 읽기');
  }

  const hookInput = JSON.parse(stdinInput);
  console.error('   ✅ Hook Input 파싱 성공');
  console.error(`   - session_id: ${hookInput.session_id}`);
  console.error(`   - tool_name: ${hookInput.tool_name}`);
  console.error(`   - transcript_path: ${hookInput.transcript_path}`);

  // Transcript 파일 읽기
  console.error('\n2. Transcript 파일 읽기:');
  const transcriptPath = hookInput.transcript_path;
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

  // 추가 정보 활용
  console.error(`\n4. 추가 정보 활용:`);
  console.error(`   - Tool: ${hookInput.tool_name}`);
  console.error(`   - Tool Input: ${JSON.stringify(hookInput.tool_input)}`);
  console.error(`   - Tool Output: ${hookInput.tool_output?.substring(0, 50)}...`);

  // 분기 로직
  if (agents.includes('content-creator') && !agents.includes('content-auditor')) {
    const response = {
      decision: 'block',
      reason: 'content-auditor 호출 필요'
    };
    console.log(JSON.stringify(response, null, 2));
    console.error('\n✅ 방식 2 성공: decision block 반환');
    process.exit(0);
  } else {
    const response = {
      decision: 'approve',
      reason: 'OK'
    };
    console.log(JSON.stringify(response, null, 2));
    console.error('\n✅ 방식 2 성공: decision approve 반환');
    process.exit(0);
  }

} catch (error) {
  console.error(`\n❌ 방식 2 실패: ${error.message}`);
  console.error(error.stack);

  const errorResponse = {
    decision: 'approve',
    reason: 'Hook 실행 실패'
  };
  console.log(JSON.stringify(errorResponse, null, 2));

  process.exit(2);  // Hook 에러
}
