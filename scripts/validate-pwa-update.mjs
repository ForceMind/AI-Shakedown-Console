import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../script.js',import.meta.url),'utf8');
const state={busy:false,chatBackupBusy:false,pwaRefreshing:false,activeConversationId:'c',conversations:[{id:'c',draft:'多行\n草稿',draftAttachments:[{id:'a'}]}]};
let persisted, saves=0, sent=0, timer, toast, navigated;
const worker={postMessage(message){assert.equal(message.type,'SKIP_WAITING');sent++;}};
const context=vm.createContext({URL,state,CONVERSATIONS_STORAGE_KEY:'chats',JSON,
 persistActiveDraft(){saves++;persisted=JSON.stringify({activeConversationId:state.activeConversationId,conversations:state.conversations});},
 localStorage:{getItem:()=>persisted},window:{location:{href:"https://example.test/?source=android&shell=v33-r2",replace(url){navigated=url;}},setTimeout(fn){timer=fn;}},
 showActionToast(...args){toast=args;},showToast(...args){toast=args;}
});
vm.runInContext(source.slice(source.indexOf('function showPwaUpdate('),source.indexOf('async function initializePwa('))+'\nglobalThis.apply=applyPwaUpdate;',context);
context.apply(worker);assert.equal(saves,1);assert.equal(sent,1);assert.equal(state.pwaRefreshing,true);
context.apply(worker);assert.equal(sent,1,'double-click must not trigger another activation');
timer();assert.equal(state.pwaRefreshing,false);assert.match(toast[0],/未完成/);
state.busy=true;context.apply(worker);assert.equal(sent,1);assert.match(toast[0],/完成或停止/);
state.busy=false;context.localStorage.getItem=()=>null;context.apply(worker);assert.equal(sent,1);assert.match(toast[0],/草稿尚未保存/);
context.localStorage.getItem=()=>persisted;
context.apply({postMessage(){throw new Error('worker unavailable');}});assert.equal(state.pwaRefreshing,false);assert.match(toast[0],/worker unavailable/);
state.conversationSnapshot=persisted;
context.localStorage.getItem=()=>JSON.stringify({activeConversationId:'other',conversations:[{id:'other',draft:'must survive'}]});
const priorSaves=saves;
context.apply(worker);assert.equal(saves,priorSaves,'must detect a stale window before persisting');assert.equal(state.pwaRefreshing,false);assert.match(toast[0],/另一窗口/);
context.localStorage.getItem=()=>persisted;
context.apply({state:'activated',postMessage(){throw new Error('must not message an already active worker');}});assert.equal(state.pwaRefreshing,false);assert.ok(navigated.includes('source=android'));assert.ok(navigated.includes('shell=v33-r2'));assert.ok(navigated.includes('refresh='));
console.log('PWA update validation passed: save/readback drafts and attachments, busy protection, repeated clicks, activation timeout and worker failure. No browser rendered.');
