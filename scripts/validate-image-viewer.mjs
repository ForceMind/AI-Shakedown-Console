import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const nodes = new Map();
const node = id => nodes.get(id) || nodes.set(id, { style:{}, open:false, hidden:true, listeners:{},
 addEventListener(name, fn) { this.listeners[name]=fn; },
 removeAttribute(name) { delete this[name]; },
 querySelectorAll() { return []; },
 showModal() { this.open=true; }, close() { this.open=false; }, setPointerCapture() {} }).get(id);
const records = new Map([['one',{data:new Blob(['image'])}], ['two',{data:new Blob(['second'])}]]);
let created=0; const revoked=[];
const context = vm.createContext({ $:node, Blob, Math, Map, URL:{createObjectURL:()=>`blob:${++created}`,revokeObjectURL:url=>revoked.push(url)},
 getAttachmentRecord:async id=>records.get(id),window:{addEventListener(){}},history:{state:null,pushState(state){this.state=state;},back(){this.state=null;}} });
vm.runInContext(source.slice(source.indexOf('const imageViewer = {'))+ '\nglobalThis.api={openImageViewer,closeImageViewer,loadImageViewer,zoomImageViewer,resetImageViewer,imageViewer};',context);
const {api}=context;
api.openImageViewer([{id:'one',kind:'image',name:'one'},{id:'two',kind:'image',name:'two'}],'one');
await new Promise(resolve=>setImmediate(resolve));
assert.equal(node('image-viewer').open,true);
assert.equal(node('image-viewer-count').textContent,'1 / 2');
api.zoomImageViewer(99); assert.equal(api.imageViewer.scale,6);
api.zoomImageViewer(0); assert.equal(api.imageViewer.scale,1);
await api.loadImageViewer(1); assert.equal(node('image-viewer-count').textContent,'2 / 2'); assert.equal(revoked.length,1);
await api.loadImageViewer(2); assert.equal(node('image-viewer-count').textContent,'1 / 2');
api.closeImageViewer(); assert.equal(node('image-viewer').open,false);assert.equal(api.imageViewer.url,null);
api.openImageViewer([{id:'missing',kind:'image',name:'missing'}],'missing');
await new Promise(resolve=>setImmediate(resolve));
assert.equal(node('image-viewer-error').hidden,false);
api.closeImageViewer();
api.openImageViewer([{id:'one',kind:'image',name:'one'}],'one');api.closeImageViewer();
await new Promise(resolve=>setImmediate(resolve)); assert.equal(api.imageViewer.url,null,'closed viewer must not leak a late URL');
console.log('Image viewer state regression passed: navigation, bounds, missing data, close and late-load URL cleanup. No browser rendered.');
