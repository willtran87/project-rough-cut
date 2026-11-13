import {readRecord,writeRecord} from './preference-store.js';

export const STATION_RECEIPT_KEY='rough-cut.night-order-receipts.v1';
export const FILED_STATIONS=['audit-bell','field-log','release-review'];
const stations=value=>Array.isArray(value)?FILED_STATIONS.filter(id=>value.includes(id)):[];
// Receipts contain completed paperwork, never perception, quiet approaches,
// player coordinates, account data or inferred actions from a legacy score.
export function normalizeStationReceipt(value,finaleRoute){
 const route=finaleRoute==='garage'?'shed':finaleRoute==='drain'?'drain':null;
 if(!route||value?.version!==1||value.route!==route||value.completed!==true)return null;
 const filed=stations(value.stations);return filed.length?{version:1,route,completed:true,stations:filed}:null;
}
export function readStationReceipt(finaleRoute){
 const records=readRecord(STATION_RECEIPT_KEY),route=finaleRoute==='garage'?'shed':'drain';
 return records.version===1?normalizeStationReceipt(records.routes?.[route],finaleRoute):null;
}
export function recordNightOrderReceipt(route,completed,{rehearsal=false}={}){
 if(rehearsal||!['shed','drain'].includes(route))return false;
 const previous=readRecord(STATION_RECEIPT_KEY),routes={};
 for(const [key,finale]of [['shed','garage'],['drain','drain']]){
  const receipt=previous.version===1?normalizeStationReceipt(previous.routes?.[key],finale):null;if(receipt)routes[key]=receipt;
 }
 routes[route]={version:1,route,completed:true,stations:stations(completed)};
 return writeRecord(STATION_RECEIPT_KEY,{version:1,routes});
}
