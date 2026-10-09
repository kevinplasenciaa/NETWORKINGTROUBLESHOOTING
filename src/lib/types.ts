export type Category = 'Switching'|'Routing'|'Security'|'Network services'|'Wireless'|'WAN & HA'|'Azure'|'AWS'|'Operations';
export type Status = 'New'|'In Progress'|'Waiting on Customer'|'Waiting on Vendor'|'Resolved'|'Reopened';
export type Mode = 'Guided Study'|'Independent Lab'|'Shift Mode';
export type Scalar = string;
export interface Client { id:string; name:string; industry:string; initials:string; color:string; sites:string[]; prefix:string; users:number; contact:string; }
export interface Asset { id:string; name:string; vendor:string; os:string; role:string; ip:string; status:string; }
export interface PublicTicket { id:string; title:string; category:Category; kind:string; difficulty:string; client:Client; priority:string; impact:string; description:string; sla:number; skills:string[]; assets:Asset[]; tools:string[]; previousNotes:string[]; requirements:string[]; related:string[]; }
export interface Field { key:string; label:string; value:string; help:string; options?:string[]; }
export interface LabState { config:Record<string,string>; candidate:Record<string,string>|null; startup:Record<string,string>; clock:number; version:number; primaryDown:boolean; management:boolean; counters:{sent:number; dropped:number}; cacheGeneration:number; events:{time:number; message:string}[]; }
export interface Scenario { ticket:PublicTicket; key:string; bad:string; good:string; evidence:string; explanation:string; hints:string[]; initial:LabState; constraints:string[]; learningResources:string[]; acceptedOutcomes:{setting:string;reference:string}[]; completionChecks:string[]; regressionChecks:string[]; }
export interface Action { seq:number; time:number; type:string; input:string; output:string; diff:Record<string,{before:string;after:string}>; }
export interface Note { id:string; time:number; kind:string; text:string; }
export interface Session { id:string; device:string; mode:string; history:{command:string;output:string}[]; }
export interface Check { id:string; name:string; pass:boolean; detail:string; }
export interface Attempt { id:string; ticketId:string; mode:Mode; status:Status; assignee:string; state:LabState; notes:Note[]; sessions:Session[]; actions:Action[]; hints:number; solutionRevealed:boolean; debriefUnlocked?:boolean; checks:Check[]; validationVersion:number; hypothesis:string; plan:{impact:string;steps:string;rollback:string;postChecks:string;approved:boolean;window:boolean}; checkpoints:{id:string;name:string;state:LabState}[]; attachments:{id:string;name:string;text:string}[]; timeEntries:{minutes:number;description:string}[]; resolution:string; debrief:string; score:Record<string,number>|null; createdAt:string; updatedAt:string; }
