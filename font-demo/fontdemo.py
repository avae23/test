import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from shapely.geometry import LineString, Polygon, MultiPolygon
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
W=70  # stroke width
def arc(cx,cy,rx,ry,a0,a1,n=24): return [(cx+rx*math.cos(math.radians(a0+(a1-a0)*i/n)),cy+ry*math.sin(math.radians(a0+(a1-a0)*i/n))) for i in range(n+1)]
ell=arc(250,350,250,350,0,360,40)
G={
 'П':[[(0,0),(0,700),(500,700),(500,0)]],
 'Р':[[(0,0),(0,700),(300,700)]+arc(300,525,175,175,90,-90)[1:]+[(0,350)]],
 'И':[[(0,0),(0,700)],[(500,0),(500,700)],[(0,0),(500,700)]],
 'В':[[(0,0),(0,700),(300,700)]+arc(300,525,175,175,90,-90)[1:]+[(0,350)],[(0,350),(330,350)]+arc(330,175,175,175,90,-90)[1:]+[(0,0)]],
 'Е':[[(500,700),(0,700),(0,0),(500,0)],[(0,350),(400,350)]],
 'Т':[[(0,700),(500,700)],[(250,700),(250,0)]],
 'М':[[(0,0),(0,700),(250,250),(500,700),(500,0)]],
 'А':[[(0,0),(250,700),(500,0)],[(100,250),(400,250)]],
 'Ш':[[(0,700),(0,0),(500,0),(500,700)],[(250,700),(250,0)]],
 'Ф':[[(250,0),(250,700)],ell[:]],
 'К':[[(0,0),(0,700)],[(480,700),(0,320)],[(120,430),(480,0)]],
 'О':[ell[:]],
 'Л':[[(0,0),(200,700),(500,700),(500,0)]],
 'Н':[[(0,0),(0,700)],[(500,0),(500,700)],[(0,350),(500,350)]],
 'С':[arc(250,350,250,350,40,320,40)],
}
NAMES={'П':'uni041F','Р':'uni0420','И':'uni0418','В':'uni0412','Е':'uni0415','Т':'uni0422','М':'uni041C','А':'uni0410','Ш':'uni0428','Ф':'uni0424','К':'uni041A','О':'uni041E','Л':'uni041B','Н':'uni041D','С':'uni0421'}
def outline(strokes):
    shapes=[LineString(s).buffer(W/2,cap_style=1,join_style=1,resolution=8) for s in strokes]
    u=unary_union(shapes)
    return list(u.geoms) if isinstance(u,MultiPolygon) else [u]
order=['.notdef','space']+[NAMES[c] for c in G]
glyphs={};adv={}
pen=TTGlyphPen(None); glyphs['.notdef']=pen.glyph(); adv['.notdef']=(600,0)
pen=TTGlyphPen(None); glyphs['space']=pen.glyph(); adv['space']=(300,0)
PAD=40
for ch,strokes in G.items():
    pen=TTGlyphPen(None)
    for poly in outline(strokes):
        poly=orient(poly,sign=-1.0)  # exterior clockwise, holes ccw (TrueType)
        for ring in [poly.exterior]+list(poly.interiors):
            pts=[(round(x+PAD),round(y)) for x,y in list(ring.coords)[:-1]]
            pen.moveTo(pts[0])
            for p in pts[1:]: pen.lineTo(p)
            pen.closePath()
    glyphs[NAMES[ch]]=pen.glyph(); adv[NAMES[ch]]=(500+W+2*PAD,0)
cmap={32:'space'}; cmap.update({ord(c):NAMES[c] for c in G})
fb=FontBuilder(1000,isTTF=True)
fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs); fb.setupHorizontalMetrics({g:(adv[g][0],0) for g in order})
fb.setupHorizontalHeader(ascent=800,descent=-200)
fb.setupNameTable({'familyName':'DemoSkeleton','styleName':'Regular'})
fb.setupOS2(sTypoAscender=800,sTypoDescender=-200,usWinAscent=900,usWinDescent=250)
fb.setupPost()
fb.save('DemoSkeleton.ttf')
print('saved',len(G),'glyphs')
from PIL import Image,ImageDraw,ImageFont
f=ImageFont.truetype('DemoSkeleton.ttf',120)
img=Image.new('RGB',(1300,420),'white'); d=ImageDraw.Draw(img)
d.text((30,10),'ШРИФТ',font=f,fill='black')
d.text((30,150),'ПРИВЕТ',font=f,fill='#1a4fd6')
d.text((30,290),'МОЛОКО',font=f,fill='#222')
img.save('fontdemo.png')
