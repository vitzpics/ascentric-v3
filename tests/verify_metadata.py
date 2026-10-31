"""Validate publication metadata, canonical routes, and share assets without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re, struct, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://ascentric.io'
class Head(HTMLParser):
    def __init__(self):
        super().__init__();self.meta={};self.canonical=[];self.icons=[];self.images=[];self.title='';self.in_title=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='meta':
            key=a.get('property') or a.get('name')
            if key in self.meta:raise AssertionError('Duplicate metadata: '+key)
            if key:self.meta[key]=a.get('content','')
        if tag=='title':self.in_title=True
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
        if tag=='link' and a.get('rel') in ['icon','apple-touch-icon']:self.icons.append(a['href'])
        if tag=='img':self.images.append(a)
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
    def handle_data(self,data):
        if self.in_title:self.title+=data

def verify():
    config='\n'.join(x for x in (ROOT/'netlify.toml').read_text().splitlines() if not x.lstrip().startswith('#'))
    routes=dict(re.findall(r'from\s*=\s*"([^"]+)"\s+to\s*=\s*"([^"]+)"',config))
    page_count=len(list(ROOT.glob('*.html')))
    canonicals=[]; titles=[];descriptions=[]
    for file in ROOT.glob('*.html'):
        p=Head();p.feed(file.read_text());assert len(p.canonical)==1,file
        url=p.canonical[0];u=urlsplit(url)
        assert u.scheme+'://'+u.netloc==ORIGIN and not u.query and not u.fragment,(file,url)
        target='index.html' if u.path=='/' else routes.get(u.path,u.path).lstrip('/')
        assert target==file.name,(file,'canonical route serves another page',url,target)
        canonicals.append(url);titles.append(p.title);descriptions.append(p.meta['description'])
        for prefix in ['og:','twitter:']:
            assert p.meta[prefix+'title']==p.title,(file,'title mismatch')
            assert p.meta[prefix+'description']==p.meta['description'],(file,'description mismatch')
            assert p.meta[prefix+'image'].startswith(ORIGIN+'/'),(file,'non-production image URL')
            image=ROOT/urlsplit(p.meta[prefix+'image']).path.lstrip('/')
            data=image.read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n'
            assert struct.unpack('>II',data[16:24])==(1200,630),(file,'invalid share dimensions')
            assert p.meta[prefix+'image:alt'],file
        assert p.meta['og:url']==url and p.meta['og:type']=='website',file
        assert p.meta['twitter:card']=='summary_large_image',file
        assert len(p.icons)>=3 and all((ROOT/icon).is_file() for icon in p.icons),file
        for img in p.images:
            assert img.get('alt'),(file,'empty image alt')
            assert int(img.get('width','0'))>0 and int(img.get('height','0'))>0,(file,'image space not reserved')
    assert len(canonicals)==len(set(canonicals))==page_count,'Duplicate or missing canonicals'
    assert len(set(titles))==page_count and len(set(descriptions))==page_count,'Titles/descriptions must be page-specific'
    ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    sitemap=[e.text for e in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc',ns)]
    assert sorted(sitemap)==sorted(canonicals),'Sitemap must contain exactly the canonical pages'
    assert 'Sitemap: '+ORIGIN+'/sitemap.xml' in (ROOT/'robots.txt').read_text()
    assert not re.search(r'Disallow:\s*/\s*$',(ROOT/'robots.txt').read_text(),re.M),'Production robots must not block the site'
    for svg in (ROOT/'assets/logos').glob('*.svg'):ET.parse(svg)
    for file,size in [('favicon-16.png',16),('favicon-32.png',32),('apple-touch-icon.png',180)]:
        data=(ROOT/'assets/icons'/file).read_bytes();assert struct.unpack('>II',data[16:24])==(size,size)
    assert (ROOT/'favicon.ico').read_bytes()[:4]==b'\x00\x00\x01\x00'
    print(f'PASS: {page_count} unique canonical routes and sitemap entries; matching social metadata; 1200×630 share image; favicons; image dimensions; valid SVG logos.')
if __name__=='__main__':verify()
