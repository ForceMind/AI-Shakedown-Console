import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const web=read('script.js');
const bridge=read('assets/local-codex-bridge.mjs');
function extract(source,name) {
    const start=source.search(new RegExp(`^(?:async )?function ${name}\\(`,'m'));
    assert.ok(start>=0,name);
    const next=source.slice(start+1).search(/^(?:async )?function /m);
    return source.slice(start,next<0?undefined:start+1+next);
}
const catalog=JSON.parse(read('agents/index.json'));
const history=[{id:'retained',role:'user',content:'keep'}];
const conversation={systemPrompt:'',activeAgent:null,history};
const state={agentCatalog:catalog,agentLibraryMode:'built-in',selectedAgentId:'',selectedAgentContent:''};
const elements={agentSearch:{value:''},agentDepartment:{value:''},systemPrompt:{value:''},agentLibraryModal:{hidden:true},agentLibraryOpen:{}};
const noOp=()=>{};
const agentContext=vm.createContext({state,elements,activeConversation:()=>conversation,persistSettings:noOp,persistConversations:noOp,renderActiveAgent:noOp,renderAgentList:noOp,closeAgentLibrary:noOp,showToast:noOp});
vm.runInContext(['filteredAgents','applySelectedAgent','clearActiveAgent'].map(n=>extract(web,n)).join('\n'),agentContext);
for(const query of ['家庭医生信息助手','Linux 系统专家','macOS 系统专家','Windows 系统专家']) {
    elements.agentSearch.value=query;
    const found=vm.runInContext('filteredAgents()',agentContext);
    assert.ok(found.length>0,query);
    const agent=found[0];state.selectedAgentId=agent.id;state.selectedAgentContent=read(agent.contentPath);
    for(const modalHidden of [true,false]) {
        elements.agentLibraryModal.hidden=modalHidden;
        vm.runInContext('applySelectedAgent()',agentContext);
        assert.equal(conversation.activeAgent.id,agent.id);
        assert.ok(conversation.systemPrompt.length>0);
        vm.runInContext('clearActiveAgent()',agentContext);
        assert.equal(conversation.activeAgent,null);
        assert.equal(conversation.systemPrompt,'');
        assert.equal(conversation.history,history);
        assert.equal(history.length,1);
        state.selectedAgentId=agent.id;state.selectedAgentContent=read(agent.contentPath);
    }
}
assert.match(web,/elements\.activeAgentClear\.addEventListener\('click', clearActiveAgent\)/);
assert.match(web,/elements\.agentRemove\.addEventListener\('click', clearActiveAgent\)/);
console.log('Agent VM checks passed: health/Linux/macOS/Windows search, apply, both cancellation contexts and history preservation.');
let subscriber;let rejectEphemeral=false;const calls=[];
const rpc={async start(){},subscribe(callback){subscriber=callback;return ()=>{subscriber=null;};},async request(method,payload){
    calls.push({method,payload});
    if(method==='thread/start'){
        if(rejectEphemeral)throw new Error('unknown field ephemeral');
        return {thread:{id:'stub-'+calls.length}};
    }
    if(method==='turn/start'){
        setTimeout(()=>subscriber?.('turn/completed',{threadId:payload.threadId,turn:{status:'completed'}}),0);
        return {turn:{id:'turn-stub'}};
    }
    throw new Error('unexpected RPC '+method);
}};
const bridgeContext=vm.createContext({rpc,conversationThreads:new Map(),checkedPrompt:()=>'fixture',appendDelta:()=>'',CLI_TIMEOUT_MS:1000,setTimeout,clearTimeout});
vm.runInContext(extract(bridge,'runCodexTurn'),bridgeContext);
for(const persistThread of [false,true]){
    bridgeContext.input={conversationKey:`${persistThread?'persisted':'ephemeral'}:same-user-conversation`,persistThread,model:'fixture-model',messages:[]};
    await vm.runInContext('runCodexTurn(input)',bridgeContext);
}
const starts=calls.filter(c=>c.method==='thread/start');
assert.equal(starts.length,2);
for(const [i,ephemeral] of [true,false].entries())assert.deepEqual(JSON.parse(JSON.stringify(starts[i].payload)),{model:'fixture-model',approvalPolicy:'never',sandbox:'read-only',serviceName:'ai_shakedown_console',ephemeral});
rejectEphemeral=true;
bridgeContext.input={conversationKey:'ephemeral:old-cli',persistThread:false,model:'fixture-model',messages:[]};
const before=calls.length;
await assert.rejects(vm.runInContext('runCodexTurn(input)',bridgeContext),/更新 Codex CLI/);
assert.equal(calls.length,before+1,'must not retry without ephemeral');
assert.match(bridge,/const conversationKey = `\$\{persistThread \? 'persisted' : 'ephemeral'\}:\$\{rawConversationKey\}`/);
console.log('App Server RPC stub passed: exact ephemeral true/false thread payloads, separate mode keys, and fail-closed unsupported-field behavior. No real CLI or model called.');
