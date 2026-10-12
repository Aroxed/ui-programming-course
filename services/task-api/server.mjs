import http from 'node:http';

let tasks = [
  { id: 1, title: 'Підготувати приклад маршрутизації', completed: false },
  { id: 2, title: 'Перевірити API стани', completed: true },
  { id: 3, title: 'Оновити сторінку деталей', completed: false },
];

const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});res.end(JSON.stringify(data))};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
  const url=new URL(req.url,'http://localhost');
  const mode=url.searchParams.get('mode');
  if(mode==='slow') await sleep(1800);
  if(mode==='error') return json(res,500,{message:'Сервер тимчасово недоступний'});
  if(req.method==='GET' && url.pathname==='/tasks') return json(res,200,mode==='empty'?[]:tasks);
  const match=url.pathname.match(/^\/tasks\/(\d+)$/);
  if(req.method==='GET' && match){const task=tasks.find(t=>t.id===Number(match[1]));return task?json(res,200,task):json(res,404,{message:'Завдання не знайдено'})}
  if(req.method==='POST' && url.pathname==='/tasks'){
    let body=''; for await (const chunk of req) body+=chunk;
    const data=JSON.parse(body||'{}'); const task={id:Math.max(...tasks.map(t=>t.id),0)+1,title:data.title||'Без назви',completed:false}; tasks=[...tasks,task]; return json(res,201,task);
  }
  json(res,404,{message:'Not found'});
}).listen(3001,'0.0.0.0',()=>console.log('Task API: http://127.0.0.1:3001'));
