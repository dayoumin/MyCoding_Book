#!/usr/bin/env node

/**
 * Hook Branching Pattern Test
 * SubagentStop Hook - Workflow Completion Check
 *
 * 테스트 목적:
 * 1. Transcript 파싱이 정상 작동하는지
 * 2. Agent 이력 기반 분기 로직이 작동하는지
 * 3. decision: "block" JSON 응답이 올바르게 생성되는지
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hook Input 읽기 (stdin 또는 파일)
function getHookInput() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // 테스트 모드: 파일에서 읽기
    const inputPath = resolve(__dirname, args[0]);
    return JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  } else {
    // 실제 Hook 모드: stdin에서 읽기
    // (실제 환경에서는 Claude가 JSON을 stdin으로 전달)
    throw new Error('Production mode not implemented in this test');
  }
}

// Transcript 파싱 - Agent 호출 이력 추출
function parseAgentCalls(transcriptPath) {
  const content = fs.readFileSync(transcriptPath, 'utf-8');
  const lines = content.trim().split('\n');
  const agents = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // Task 도구 사용 감지
      if (entry.type === 'tool_use' && entry.tool === 'Task') {
        const subagentType = entry.input?.subagent_type;
        if (subagentType) {
          agents.push(subagentType);
        }
      }
    } catch (err) {
      console.error('[WARN] Failed to parse transcript line:', line);
    }
  }

  return agents;
}

// 에러/경고 감지
function checkWarnings(transcriptPath) {
  const content = fs.readFileSync(transcriptPath, 'utf-8');
  const warnings = [];

  content.split('\n').forEach((line, idx) => {
    if (line.includes('⚠️') ||
        line.includes('경고') ||
        line.includes('warning') ||
        line.includes('WARNING')) {
      warnings.push(`Line ${idx + 1}: ${line.substring(0, 100)}`);
    }
  });

  return warnings;
}

// 워크플로우 완료도 체크
function checkWorkflowCompletion(input) {
  const transcriptPath = resolve(__dirname, input.transcript_path);

  console.error('[INFO] Transcript path:', transcriptPath);

  if (!fs.existsSync(transcriptPath)) {
    console.error('[ERROR] Transcript file not found');
    return approve('Transcript not found - skipping check');
  }

  // 1. Agent 이력 파싱
  const agents = parseAgentCalls(transcriptPath);
  console.error('[INFO] Detected agents:', agents);

  // 2. 워크플로우 타입 감지
  const isContentWorkflow = agents.some(a => a.includes('content-'));
  if (!isContentWorkflow) {
    console.error('[INFO] Not a content workflow');
    return approve('Not a content workflow');
  }

  // 3. 분기 로직

  // 분기 A: creator만 완료
  if (agents.includes('content-creator') &&
      !agents.includes('content-auditor')) {
    return block(
      'content-creator 완료.\n' +
      '다음: Task(content-auditor, "방금 생성된 콘텐츠 검증해줘")'
    );
  }

  // 분기 B: auditor 완료, 에러 체크
  if (agents.includes('content-auditor') &&
      !agents.includes('content-reviewer')) {

    const warnings = checkWarnings(transcriptPath);

    // 분기 B-1: 에러/경고 있음
    if (warnings.length > 0) {
      return block(
        `content-auditor에서 ${warnings.length}개 경고 발견.\n` +
        `수정 후 content-auditor 재실행 필요.\n\n` +
        `문제점:\n${warnings.slice(0, 3).join('\n')}`
      );
    }

    // 분기 B-2: 깨끗함
    return block(
      'content-auditor 통과.\n' +
      '다음: Task(content-reviewer, "최종 리뷰 진행")'
    );
  }

  // 분기 C: reviewer 완료
  if (agents.includes('content-reviewer')) {
    return approve('✅ 3중 검증 완료!');
  }

  // 기본: 통과
  return approve('Workflow check passed');
}

// Helper 함수들
function block(reason) {
  const response = {
    decision: 'block',
    reason: reason
  };

  console.log(JSON.stringify(response, null, 2));
  console.error('[DECISION] BLOCK -', reason);

  process.exit(0);  // 중요: exit(0)으로 Hook 성공 표시
}

function approve(reason) {
  const response = {
    decision: 'approve',
    reason: reason
  };

  console.log(JSON.stringify(response, null, 2));
  console.error('[DECISION] APPROVE -', reason);

  process.exit(0);
}

// 메인 실행
try {
  const input = getHookInput();
  console.error('[INFO] Hook triggered for tool:', input.tool_name);

  checkWorkflowCompletion(input);
} catch (error) {
  console.error('[ERROR]', error.message);
  console.error(error.stack);

  // Hook 에러는 exit(2)로 표시
  process.exit(2);
}
