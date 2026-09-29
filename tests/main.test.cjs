/* Regression coverage for the existing Netlify contract and local preview safety. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
function fixture({local = false, ok = true, reject = false, search = ''} = {}) {
  let submit;
  let calls = [];
  let resets = 0;
  const button = {textContent: 'Send Message', disabled: false};
  const status = {textContent: '', dataset: {}};
  const select = {value: ''};
  const form = {querySelector: () => button, addEventListener: (name, fn) => {if(name === 'submit') submit = fn;}, reset: () => resets++};
  const document = {querySelector: () => null, querySelectorAll: () => [], getElementById: id => ({'contact-form': form, 'form-status': status, interest: select})[id]};
  const window = {addEventListener() {}, matchMedia: () => ({matches: false}), location: {hash: '', pathname: '/contact.html', hostname: local ? '127.0.0.1' : 'ascentric.io', protocol: 'http:', search}};
  vm.runInNewContext(source, {document, window, URLSearchParams, FormData: class { *[Symbol.iterator]() {yield ['form-name','contact'];yield ['name','Test'];} }, fetch: async (...args) => {calls.push(args); if(reject) throw new Error('Network unavailable');return {ok};}});
  return {button,status,select,calls,resetCount:()=>resets,submit:()=>submit({preventDefault(){}})};
}
test('Local preview never submits a real message', async () => {
 const f = fixture({local:true}); await f.submit(); assert.equal(f.calls.length,0); assert.match(f.status.textContent,/has not been sent/); assert.equal(f.resetCount(),0);
});
test('Successful submission uses the original Netlify destination and form name', async () => {
 const f = fixture(); await f.submit(); assert.equal(f.calls.length,1); assert.equal(f.calls[0][0],'/'); assert.equal(f.calls[0][1].method,'POST'); assert.match(f.calls[0][1].body,/form-name=contact/); assert.equal(f.resetCount(),1); assert.equal(f.status.dataset.state,'success'); assert.equal(f.button.disabled,false);
});
test('An HTTP failure cannot display success or clear the message', async () => {
 const f = fixture({ok:false}); await f.submit(); assert.equal(f.status.dataset.state,'error'); assert.equal(f.resetCount(),0); assert.equal(f.button.textContent,'Send Message'); assert.equal(f.button.disabled,false);
});
test('A network failure preserves the message and enables retry', async () => {
 const f = fixture({reject:true}); await f.submit(); assert.equal(f.status.dataset.state,'error'); assert.equal(f.resetCount(),0); assert.equal(f.button.disabled,false);
});
test('Current and legacy inquiry links select an available buyer-facing option', () => {
 const html = fs.readFileSync(path.join(__dirname, '../contact.html'), 'utf8');
 const options = [...html.matchAll(/<option>(.*?)<\/option>/g)].map(m => m[1].replaceAll('&amp;', '&'));
 assert.equal(options.length, 6);
 const cases = {
   strategy: 'Strategy & Organization', culture: 'Culture & Teams',
   leadership: 'Executive Leadership / Coaching', 'eq-i': 'Executive Leadership / Coaching',
   'class-iv': 'Culture & Teams', 'culture-cartography': 'Culture & Teams',
   speaking: 'Speaking / Workshop / Offsite', offsites: 'Speaking / Workshop / Offsite',
   partnership: 'Partnership', partnerships: 'Partnership'
 };
 for (const [key, expected] of Object.entries(cases)) {
   const value = fixture({search: '?interest=' + key}).select.value;
   assert.equal(value, expected);
   assert.ok(options.includes(value), key + ' must match a real select option');
 }
 assert.equal(fixture({search:'?interest=unknown'}).select.value,'');
});

test('The manual carousel supports three or more quotes and wraps accessibly', () => {
  const slides = Array.from({length: 3}, () => ({hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v;}}));
  const controls = {hidden:true};
  const status = {textContent:''};
  const handlers = {};
  const carousel = {
    querySelectorAll: () => slides,
    querySelector: s => ({'.carousel-controls':controls,'[data-carousel-status]':status,'[data-carousel-prev]':{addEventListener:(n,f)=>handlers.prev=f},'[data-carousel-next]':{addEventListener:(n,f)=>handlers.next=f}})[s],
    addEventListener:(n,f)=>handlers[n]=f
  };
  const document = {querySelector:()=>null,querySelectorAll:s=>s==='.testimonial-carousel'?[carousel]:[],getElementById:()=>null};
  const window = {matchMedia:()=>({matches:true}),addEventListener(){},location:{pathname:'/',hash:''}};
  vm.runInNewContext(source,{document,window});
  assert.equal(controls.hidden,false);
  assert.deepEqual(slides.map(s=>s.hidden),[false,true,true]);
  assert.equal(slides[0].attrs['aria-label'],'1 of 3');
  handlers.prev();
  assert.deepEqual(slides.map(s=>s.hidden),[true,true,false]);
  assert.equal(status.textContent,'3 / 3');
  handlers.next();
  assert.equal(status.textContent,'1 / 3');
  let prevented=false;
  handlers.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.deepEqual(slides.map(s=>s.hidden),[true,false,true]);
  assert.equal(status.textContent,'2 / 3');
});

test('An engagement deep link opens its native disclosure', () => {
  const disclosure={open:false,matches:s=>s==='details'};
  const document={querySelector:()=>null,querySelectorAll:()=>[],getElementById:id=>id==='diagnostic'?disclosure:null};
  const window={matchMedia:()=>({matches:false}),addEventListener(){},location:{pathname:'/services.html',hash:'#diagnostic'}};
  vm.runInNewContext(source,{document,window});
  assert.equal(disclosure.open,true);
});
