"""Dependency-free checks for the static site. Run from any directory."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.images=[]; self.h1=0; self.main=0; self.stack=[]; self.errors=[]; self.forms=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag not in VOID: self.stack.append(tag)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='main': self.main+=1
        if tag=='form': self.forms.append(a)
        if tag=='img': self.images.append(a)
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if tag in ('script','img','link'):
            url=a.get('src') or a.get('href')
            if url:self.links.append(url)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID:self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if tag in VOID:return
        if not self.stack or self.stack[-1]!=tag:self.errors.append('Unexpected closing '+tag)
        else:self.stack.pop()

def verify():
    pages={}
    issues=[]
    for f in ROOT.glob('*.html'):
        page=Page();page.feed(f.read_text());pages[f.name]=page
    for name,p in pages.items():
        if p.h1!=1:issues.append(f'{name}: expected one H1')
        if p.main!=1:issues.append(f'{name}: expected one main')
        if p.stack or p.errors:issues.append(f'{name}: nesting {p.errors} / unclosed {p.stack}')
        if len(set(p.ids))!=len(p.ids):issues.append(f'{name}: duplicate IDs')
        for img in p.images:
            if 'alt' not in img:issues.append(f'{name}: missing alt text')
        for href in p.links:
            u=urlsplit(href)
            if u.scheme or u.netloc:continue
            target=unquote(u.path) or name
            if not (ROOT/target).is_file():issues.append(f'{name}: missing file {href}')
            elif u.fragment and target in pages and u.fragment not in pages[target].ids:issues.append(f'{name}: missing anchor {href}')
    form=pages['contact.html'].forms[0]
    for key,value in {'id':'contact-form','name':'contact','method':'POST','data-netlify':'true','data-netlify-honeypot':'bot-field'}.items():
        if form.get(key)!=value:issues.append(f'Netlify form contract changed: {key}')
    contact=(ROOT/'contact.html').read_text()
    for field in ['form-name','bot-field','name','email','company','interest','message']:
        if not re.search(r'name="'+field+r'"',contact):issues.append('Missing form field '+field)
    for f in ['index.html','services.html','culture-cartography.html','class-iv.html']:
        text=(ROOT/f).read_text()
        if 'Book a Free Clarity Call' in text:issues.append(f'{f}: retired CTA')
    if issues:
        print('\n'.join(issues));raise SystemExit(1)
    print(f'PASS: {len(pages)} pages; balanced HTML; landmarks; unique IDs; internal links and anchors; image alt text; original Netlify form contract.')
if __name__=='__main__':verify()
