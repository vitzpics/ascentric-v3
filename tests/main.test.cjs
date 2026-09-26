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
  const window = {matchMedia: () => ({matches: false}), location: {pathname: '/contact.html', hostname: local ? '127.0.0.1' : 'ascentric.io', protocol: 'http:', search}};
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
test('Existing Class IV contact links still select the correct interest', () => {
 assert.equal(fixture({search:'?interest=class-iv'}).select.value,'Class IV Leadership');
 assert.equal(fixture({search:'?interest=unknown'}).select.value,'');
});
