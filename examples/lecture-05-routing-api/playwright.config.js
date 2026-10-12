import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  use:{baseURL:'http://127.0.0.1:4175',viewport:{width:1280,height:900}},
  webServer:[
    {command:'npm run start --workspace=@course/task-api',port:3001,reuseExistingServer:true},
    {command:'npm run dev -- --host 127.0.0.1 --port 4175',port:4175,reuseExistingServer:true}
  ]
});
