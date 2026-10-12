const API='http://127.0.0.1:3001';
export async function getTasks(mode=''){const r=await fetch(`${API}/tasks${mode?`?mode=${mode}`:''}`);if(!r.ok)throw new Error('Не вдалося завантажити завдання');return r.json()}
export async function getTask(id){const r=await fetch(`${API}/tasks/${id}`);if(!r.ok)throw new Error('Завдання не знайдено');return r.json()}
export async function createTask(title){const r=await fetch(`${API}/tasks`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title})});if(!r.ok)throw new Error('Не вдалося створити завдання');return r.json()}
