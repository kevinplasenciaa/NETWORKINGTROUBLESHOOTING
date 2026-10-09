import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Attempt, Mode } from './types';
import { copy } from './engine';
import { getScenario } from './scenarios';
const directory=resolve(process.env.NETTASK_DATA_DIR??'.data');
mkdirSync(directory,{recursive:true});
const db=new DatabaseSync(resolve(directory,'nettask.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, ticket_id TEXT NOT NULL, owner TEXT NOT NULL, body TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS preferences (owner TEXT PRIMARY KEY, body TEXT NOT NULL);`);
export function createAttempt(owner:string,ticketId:string,mode:Mode):Attempt {
 const s=getScenario(ticketId),now=new Date().toISOString();
 const a:Attempt={id:crypto.randomUUID(),ticketId,mode,status:'In Progress',assignee:'You',state:copy(s.initial),notes:s.ticket.previousNotes.map(text=>({id:crypto.randomUUID(),time:0,kind:'Previous technician',text})),sessions:[{id:crypto.randomUUID(),device:'endpoint',mode:'exec',history:[]}],actions:[],hints:0,solutionRevealed:false,checks:[],validationVersion:-1,hypothesis:'',plan:{impact:'',steps:'',rollback:'',postChecks:'',approved:false,window:false},checkpoints:[],attachments:[],timeEntries:[],resolution:'',debrief:'',score:null,createdAt:now,updatedAt:now};
 saveAttempt(owner,a);return a;
}
export function saveAttempt(owner:string,a:Attempt){a.updatedAt=new Date().toISOString();db.prepare('INSERT INTO attempts(id,ticket_id,owner,body) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body WHERE attempts.owner=excluded.owner').run(a.id,a.ticketId,owner,JSON.stringify(a));}
export function attemptsFor(owner:string):Attempt[]{return (db.prepare('SELECT body FROM attempts WHERE owner=? ORDER BY rowid DESC').all(owner) as {body:string}[]).map(r=>JSON.parse(r.body));}
export function getAttempt(owner:string,id:string):Attempt {const row=db.prepare('SELECT body FROM attempts WHERE owner=? AND id=?').get(owner,id) as {body:string}|undefined;if(!row)throw new Error('Attempt not found');return JSON.parse(row.body);}
export function preferences(owner:string){const row=db.prepare('SELECT body FROM preferences WHERE owner=?').get(owner)as {body:string}|undefined;return row?JSON.parse(row.body):{mode:'Guided Study',shift:{clock:0,events:[]}};}
export function savePreferences(owner:string,body:{mode:Mode;shift?:{clock:number;events:{time:number;message:string;ticketId:string}[]};kb?:Record<string,{text:string;time:number;ticketId:string}>}){db.prepare('INSERT INTO preferences(owner,body) VALUES(?,?) ON CONFLICT(owner) DO UPDATE SET body=excluded.body').run(owner,JSON.stringify(body));}
