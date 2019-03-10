import { choose } from './index';

test('random at 0.5 should work properly', () => {
  const mockMath = Object.create(global.Math);
  mockMath.random = () => 0.5;
  global.Math = mockMath;

  expect(choose([0, 1, 2], [0.1, 0.8, 0.1])).toBe(1);
  expect(choose([0, 1, 2, 3], [0.1, 0.1, 0.1, 0.7])).toBe(3);
  expect(choose([0, 1, 2, 3, 4], [0.55, 0.15, 0.2, 0.04, 0.06])).toBe(0);
});

test('random at 0.95 should work properly', () => {
  const mockMath = Object.create(global.Math);
  mockMath.random = () => 0.95;
  global.Math = mockMath;

  expect(choose([0, 1, 2], [0.1, 0.8, 0.1])).toBe(2);
  expect(choose([0, 1, 2, 3, 4], [0.55, 0.15, 0.2, 0.04, 0.06])).toBe(4);
});
