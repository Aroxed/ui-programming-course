import { test, expect } from '@playwright/test';
import { selectTasks, summarizeTasks } from '../src/taskData.js';

const items = [
  {id:1,title:'Звіт',priority:'Низький',completed:false},
  {id:2,title:'Звіт з баз даних',priority:'Високий',completed:false},
  {id:3,title:'Конспект',priority:'Середній',completed:true},
];
test('selection honors explicit expected values and preserves source order', () => {
  expect(selectTasks(items,'  ЗВІТ  ','active','priority').map(t=>t.id)).toEqual([2,1]);
  expect(selectTasks(items,'','completed','id').map(t=>t.id)).toEqual([3]);
  expect(selectTasks(items,'','all','title').map(t=>t.id)).toEqual([1,2,3]);
  expect(selectTasks(items,'відсутнє','all','priority')).toEqual([]);
  expect(items.map(t=>t.id)).toEqual([1,2,3]);
  expect(summarizeTasks(items)).toEqual({total:3,completed:1,active:2,highActive:1});
});
