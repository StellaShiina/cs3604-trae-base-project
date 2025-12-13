/**
 * ProgressBar组件单元测试
 * 测试文件：frontend/test/components/ForgotPassword/ProgressBar.test.tsx
 * 对应源文件：frontend/src/components/ForgotPassword/ProgressBar.tsx
 * 
 * 测试目标：验证进度条组件的显示逻辑
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from '../../../src/components/ForgotPassword/ProgressBar';

describe('ProgressBar 组件测试', () => {
  const steps = ['填写账户信息', '获取验证码', '设置新密码', '完成'];

  describe('UI渲染', () => {
    it('应该渲染所有4个步骤标签', () => {
      render(<ProgressBar currentStep={1} />);

      steps.forEach((step) => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('应该在步骤1时只高亮第一个节点', () => {
      const { container } = render(<ProgressBar currentStep={1} />);

      const activeNodes = container.querySelectorAll('.progress-node.active');
      expect(activeNodes.length).toBe(1);

      const currentNode = container.querySelector('.progress-node.current');
      expect(currentNode).toBeInTheDocument();
    });

    it('应该在步骤2时高亮前两个节点', () => {
      const { container } = render(<ProgressBar currentStep={2} />);

      const activeNodes = container.querySelectorAll('.progress-node.active');
      expect(activeNodes.length).toBe(2);
    });

    it('应该在步骤3时高亮前三个节点', () => {
      const { container } = render(<ProgressBar currentStep={3} />);

      const activeNodes = container.querySelectorAll('.progress-node.active');
      expect(activeNodes.length).toBe(3);
    });

    it('应该在步骤4时高亮所有节点', () => {
      const { container } = render(<ProgressBar currentStep={4} />);

      const activeNodes = container.querySelectorAll('.progress-node.active');
      expect(activeNodes.length).toBe(4);
    });
  });

  describe('进度线显示', () => {
    it('应该在步骤1时没有激活的进度线', () => {
      const { container } = render(<ProgressBar currentStep={1} />);

      const activeLines = container.querySelectorAll('.progress-line.active');
      expect(activeLines.length).toBe(0);
    });

    it('应该在步骤2时有1条激活的进度线', () => {
      const { container } = render(<ProgressBar currentStep={2} />);

      const activeLines = container.querySelectorAll('.progress-line.active');
      expect(activeLines.length).toBe(1);
    });

    it('应该在步骤4时有3条激活的进度线', () => {
      const { container } = render(<ProgressBar currentStep={4} />);

      const activeLines = container.querySelectorAll('.progress-line.active');
      expect(activeLines.length).toBe(3);
    });
  });

  describe('完成标记', () => {
    it('应该在完成的步骤显示"✓"标记', () => {
      const { container } = render(<ProgressBar currentStep={3} />);

      const completedNodes = Array.from(
        container.querySelectorAll('.progress-node.active .node-circle')
      );

      // 前两个节点应该显示✓
      expect(completedNodes[0].textContent).toContain('✓');
      expect(completedNodes[1].textContent).toContain('✓');
    });

    it('当前步骤不应该显示"✓"标记', () => {
      const { container } = render(<ProgressBar currentStep={2} />);

      const currentNode = container.querySelector('.progress-node.current .node-circle');
      expect(currentNode?.textContent).not.toContain('✓');
    });
  });

  describe('标签高亮', () => {
    it('应该高亮已完成和当前步骤的标签', () => {
      const { container } = render(<ProgressBar currentStep={2} />);

      const activeLabels = container.querySelectorAll('.progress-label.active');
      expect(activeLabels.length).toBe(2);
    });

    it('未到达的步骤标签不应该高亮', () => {
      const { container } = render(<ProgressBar currentStep={1} />);

      const inactiveLabels = container.querySelectorAll('.progress-label:not(.active)');
      expect(inactiveLabels.length).toBe(3);
    });
  });
});

