// Extension boundary only. No live infrastructure adapters are installed or invoked.
import type { LabState } from './types';
export interface LabAdapter {
 readonly kind:'simulated'|'gns3'|'eve-ng'|'containerlab'|'isolated-cloud';
 readonly capabilities:string[];
 inspect():Promise<LabState>;
 execute(deviceId:string,command:string):Promise<{output:string;state:LabState}>;
 checkpoint(name:string):Promise<string>;
 rollback(checkpointId:string):Promise<LabState>;
}
export interface AdapterRegistration {adapter:LabAdapter;isolatedLabId:string;userProvided:true;}
