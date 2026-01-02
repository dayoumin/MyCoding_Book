#!/usr/bin/env node

/**
 * Hook Branching Pattern - Simulation Test Suite
 *
 * 테스트 시나리오:
 * 1. content-creator만 실행된 경우 → block + auditor 요청
 * 2. content-creator + auditor 실행 → block + reviewer 요청
 * 3. 모든 Agent 실행 완료 → approve
 * 4. auditor에서 경고 발견 → block + 수정 요청
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HOOK_SCRIPT = resolve(__dirname, 'check-workflow-completion.mjs');

// 테스트 헬퍼
function runTest(testName, transcriptContent, expectedDecision, expectedReasonContains) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST: ${testName}`);
  console.log('='.repeat(60));

  // Transcript 생성
  const transcriptPath = resolve(__dirname, 'test-transcript.jsonl');
  fs.writeFileSync(transcriptPath, transcriptContent);

  // Hook Input 생성
  const hookInput = {
    session_id: 'test-session',
    transcript_path: 'test-transcript.jsonl',
    tool_name: 'Task',
    tool_input: { subagent_type: 'content-creator' },
    tool_output: 'Done'
  };

  const inputPath = resolve(__dirname, 'test-input.json');
  fs.writeFileSync(inputPath, JSON.stringify(hookInput, null, 2));

  // Hook 실행
  try {
    const output = execSync(`node "${HOOK_SCRIPT}" test-input.json`, {
      cwd: __dirname,
      encoding: 'utf-8'
    });

    const response = JSON.parse(output);

    console.log('📤 Hook Response:');
    console.log(JSON.stringify(response, null, 2));

    // 검증
    const decisionMatch = response.decision === expectedDecision;
    const reasonMatch = !expectedReasonContains ||
                       response.reason?.includes(expectedReasonContains);

    if (decisionMatch && reasonMatch) {
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
      console.log(`   Expected decision: ${expectedDecision}`);
      console.log(`   Actual decision: ${response.decision}`);
      if (expectedReasonContains) {
        console.log(`   Expected reason to contain: ${expectedReasonContains}`);
        console.log(`   Actual reason: ${response.reason}`);
      }
    }

    return decisionMatch && reasonMatch;

  } catch (error) {
    console.log('❌ FAIL - Hook execution error');
    console.log(error.message);
    return false;
  } finally {
    // 정리
    if (fs.existsSync(transcriptPath)) fs.unlinkSync(transcriptPath);
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  }
}

// 테스트 실행
console.log('\n' + '🚀 Hook Branching Pattern - Simulation Tests'.padEnd(60, ' '));

const results = [];

// 테스트 1: content-creator만 실행
results.push(runTest(
  'Scenario 1: Only content-creator executed',
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-creator"}}\n{"type":"tool_result","tool":"Task","output":"Done"}`,
  'block',
  'content-auditor'
));

// 테스트 2: content-creator + auditor 실행
results.push(runTest(
  'Scenario 2: content-creator + auditor executed',
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-creator"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"Done"}\n` +
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-auditor"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"검증 완료"}`,
  'block',
  'content-reviewer'
));

// 테스트 3: 모든 Agent 실행 완료
results.push(runTest(
  'Scenario 3: All agents executed (3-tier validation complete)',
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-creator"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"Done"}\n` +
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-auditor"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"검증 완료"}\n` +
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-reviewer"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"리뷰 통과"}`,
  'approve',
  '3중 검증 완료'
));

// 테스트 4: auditor에서 경고 발견
results.push(runTest(
  'Scenario 4: Warning detected in auditor output',
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-creator"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"Done"}\n` +
  `{"type":"tool_use","tool":"Task","input":{"subagent_type":"content-auditor"}}\n` +
  `{"type":"tool_result","tool":"Task","output":"⚠️ 경고: explanation 누락"}`,
  'block',
  '경고 발견'
));

// 테스트 5: 비워크플로우 (통과)
results.push(runTest(
  'Scenario 5: Non-workflow task (should approve)',
  `{"type":"tool_use","tool":"Read","input":{"file_path":"test.txt"}}\n` +
  `{"type":"tool_result","tool":"Read","output":"Content"}`,
  'approve',
  'Not a content workflow'
));

// 결과 요약
console.log('\n' + '='.repeat(60));
console.log('📊 Test Results Summary');
console.log('='.repeat(60));

const passed = results.filter(r => r).length;
const total = results.length;

console.log(`✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${total - passed}/${total}`);

if (passed === total) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.');
  process.exit(1);
}
