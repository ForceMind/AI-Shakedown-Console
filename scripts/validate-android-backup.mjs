import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../script.js',import.meta.url),'utf8');
const text='中文🙂'.repeat(20000);
const state={busy:false,chatBackupBusy:false,activeConversationId:'c',apiKey:'DO-NOT-EXPORT',conversations:[{id:'c',title:'旧对话',systemPrompt:'系统',draft:text,createdAt:1,activeAgent:{id:'role'},history:[{id:'m',role:'user',content:'旧消息',attachments:[{id:'a'}]}],draftAttachments:[],branchAtMessageId:'',parentConversationId:''}]};
const record={id:'a',kind:'image',name:'图片.png',type:'image/png',data:new Blob(['image-bytes'])};
let busy=false;
const context=vm.createContext({state,Blob,TextEncoder,ArrayBuffer,Uint8Array,JSON,Date,
 CHAT_BACKUP_FORMAT:'ai-shakedown-console-chat-backup',CHAT_BACKUP_FORMAT_VERSION:1,APP_VERSION:'v33',MAX_CHAT_BACKUP_FILE_BYTES:512*1024*1024,
 assertConversationStorageCurrent(){},createId:()=> 'backup-test',persistActiveDraft(){},referencedAttachmentIds:()=>new Set(['a']),getAttachmentRecord:async()=>record,
 attachmentMetadata:r=>({id:r.id,kind:r.kind,name:r.name,type:r.type,size:r.data.size}),
 arrayBufferToBase64:value=>Buffer.from(value instanceof ArrayBuffer?new Uint8Array(value):value).toString('base64'),
 setChatBackupBusy(value){busy=value;state.chatBackupBusy=value;},
 window:{addEventListener(){},setTimeout(){return 1;},clearTimeout(){}},
});
vm.runInContext(source.slice(source.indexOf('function backupConversationSnapshot('),source.indexOf('function decodeBackupBase64('))+'\nglobalThis.handle=handleAndroidBackupRequest;',context);
const messages=[];const port={postMessage(data){messages.push(JSON.parse(data));},start(){},close(){this.closed=true;}};
await context.handle({source:{},data:'AI_SHAKEDOWN_EXPORT_BACKUP_V1',ports:[port]});assert.equal(messages.length,0,'reject requests from a page/iframe');
await context.handle({source:null,data:'AI_SHAKEDOWN_EXPORT_BACKUP_V1',ports:[port]});assert.equal(messages[0].type,'start');assert.equal(busy,true);
const chunks=[];
while(true){port.onmessage({data:'next'});const message=messages.at(-1);if(message.type==='end')break;assert.equal(message.type,'chunk');chunks.push(Buffer.from(message.data,'base64'));}
const bytes=Buffer.concat(chunks);assert.equal(bytes.length,messages[0].size);
const backup=JSON.parse(bytes.toString('utf8'));assert.equal(backup.conversations[0].draft,text);assert.equal(backup.attachments[0].data,Buffer.from('image-bytes').toString('base64'));assert.ok(!bytes.includes(Buffer.from('DO-NOT-EXPORT')));
assert.equal(state.conversations[0].history[0].id,'m','export must not mutate source IDs');
port.onmessage({data:'saved'});assert.equal(busy,false);assert.equal(port.closed,true);
console.log('Android backup protocol validation passed: native-only port, UTF-8 chunk boundaries, exact bytes and attachments, credential exclusion, source preservation and acknowledgement cleanup. Android SAF not exercised.');
