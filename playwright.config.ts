import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',workers:1,timeout:30000,use:{baseURL:'http://127.0.0.1:3000',launchOptions:{executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']},viewport:{width:1440,height:1000}},reporter:'list'});
