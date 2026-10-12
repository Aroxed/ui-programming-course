import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { createTask, getTask, getTasks } from './api.js';

function Layout(){return <><header><strong>Task app</strong><nav><NavLink to="/tasks">Завдання</NavLink><Link to="/tasks/2">Приклад деталей</Link></nav></header><Routes><Route path="/" element={<Home/>}/><Route path="/tasks" element={<TasksPage/>}/><Route path="/tasks/:taskId" element={<TaskDetails/>}/><Route path="*" element={<p>Сторінку не знайдено.</p>}/></Routes></>}
function Home(){return <main><h1>Маршрутизація та API</h1><p><Link to="/tasks">Відкрити список завдань →</Link></p></main>}
function TasksPage(){
 const loc=useLocation(); const nav=useNavigate(); const mode=new URLSearchParams(loc.search).get('mode')||'';
 const [status,setStatus]=useState('loading'); const [tasks,setTasks]=useState([]); const [title,setTitle]=useState('');
 async function load(){setStatus('loading');try{const data=await getTasks(mode);setTasks(data);setStatus(data.length?'success':'empty')}catch{setStatus('error')}}
 useEffect(()=>{load()},[mode]);
 async function submit(e){e.preventDefault();if(!title.trim())return;const task=await createTask(title.trim());setTasks(v=>[...v,task]);setTitle('');setStatus('success')}
 return <main><h1>Завдання</h1><p className="modes">Стани: <Link to="/tasks?mode=empty">empty</Link> · <Link to="/tasks?mode=error">error</Link> · <Link to="/tasks?mode=slow">slow</Link></p>
 {status==='loading'&&<p role="status">Завантаження…</p>}{status==='error'&&<div><p role="alert">Не вдалося завантажити завдання.</p><button onClick={()=>nav('/tasks')}>Спробувати ще раз</button></div>}{status==='empty'&&<p>Завдань поки немає.</p>}
 {status==='success'&&<ul>{tasks.map(t=><li key={t.id}><Link to={`/tasks/${t.id}`}>{t.title}</Link>{t.completed&&<small>виконано</small>}</li>)}</ul>}
 <form onSubmit={submit}><label>Нове завдання<input value={title} onChange={e=>setTitle(e.target.value)}/></label><button>Додати</button></form></main>
}
function TaskDetails(){const {taskId}=useParams();const [task,setTask]=useState(null);const [error,setError]=useState('');useEffect(()=>{getTask(taskId).then(setTask).catch(e=>setError(e.message))},[taskId]);return <main><p><Link to="/tasks">← До списку</Link></p>{error?<p role="alert">{error}</p>:!task?<p>Завантаження…</p>:<><h1>{task.title}</h1><dl><dt>ID</dt><dd>{task.id}</dd><dt>Стан</dt><dd>{task.completed?'Виконано':'Активне'}</dd></dl></>}</main>}
export default function App(){return <Layout/>}
