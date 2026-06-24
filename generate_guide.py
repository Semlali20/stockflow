
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, Flowable, KeepTogether
)
import os, math

OUTPUT = r"C:\Users\Legion\Downloads\Guide_StockFlow.pdf"

# ── Brand colors ──────────────────────────────────────────────────────────────
PRIMARY   = colors.HexColor("#4F46E5")
PLT       = colors.HexColor("#6366F1")
TEAL      = colors.HexColor("#06B6D4")
SUCCESS   = colors.HexColor("#10B981")
AMBER     = colors.HexColor("#F59E0B")
DANGER    = colors.HexColor("#F43F5E")
DARK      = colors.HexColor("#1E1B4B")
GRAY_D    = colors.HexColor("#374151")
GRAY_M    = colors.HexColor("#6B7280")
GRAY_L    = colors.HexColor("#F3F4F6")
GRAY_LLT  = colors.HexColor("#F9FAFB")
DARK_BG   = colors.HexColor("#0E0B1E")
DARK_SURF = colors.HexColor("#16121E")
DARK_SURF2= colors.HexColor("#1C1830")
DARK_BDR  = colors.HexColor("#2A2545")
INDIGO_BG = colors.HexColor("#EEF2FF")
WHITE     = colors.white
VIOLET    = colors.HexColor("#7C3AED")
TEAL_LT   = colors.HexColor("#22D3EE")

# ── Styles ────────────────────────────────────────────────────────────────────
def S(name, **kw): return ParagraphStyle(name, **kw)

h1   = S("H1",  fontSize=22, leading=28, textColor=PRIMARY,     fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=6)
h2   = S("H2",  fontSize=15, leading=20, textColor=DARK,        fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=5)
h3   = S("H3",  fontSize=12, leading=16, textColor=PRIMARY,     fontName="Helvetica-Bold", spaceBefore=8,  spaceAfter=4)
body = S("BD",  fontSize=10, leading=15, textColor=GRAY_D,      fontName="Helvetica",      alignment=TA_JUSTIFY, spaceAfter=5)
bul  = S("BL",  fontSize=10, leading=14, textColor=GRAY_D,      fontName="Helvetica",      leftIndent=14, spaceAfter=3)
cap  = S("CP",  fontSize=8,  leading=11, textColor=GRAY_M,      fontName="Helvetica-Oblique", alignment=TA_CENTER)
tip  = S("TIP", fontSize=9,  leading=13, textColor=colors.HexColor("#1E40AF"), fontName="Helvetica")
warn = S("WRN", fontSize=9,  leading=13, textColor=colors.HexColor("#92400E"), fontName="Helvetica")
note = S("NT",  fontSize=9,  leading=13, textColor=colors.HexColor("#065F46"), fontName="Helvetica")
toc_t= S("TT",  fontSize=10, leading=15, textColor=GRAY_D,      fontName="Helvetica")
toc_n= S("TN",  fontSize=10, leading=15, textColor=PRIMARY,     fontName="Helvetica-Bold")
step = S("ST",  fontSize=10, leading=14, textColor=GRAY_D,      fontName="Helvetica", leftIndent=28, spaceAfter=4)

def hr(c=PRIMARY, t=1.5, a=6, b=6):
    return HRFlowable(width="100%", thickness=t, color=c, spaceAfter=a, spaceBefore=b)

def bullets(items):
    return [Paragraph(f"• {i}", bul) for i in items]

def tip_box(text, kind="tip"):
    colors_map = {
        "tip":  (colors.HexColor("#EFF6FF"), colors.HexColor("#1D4ED8"), "💡 Conseil"),
        "warn": (colors.HexColor("#FFFBEB"), colors.HexColor("#B45309"), "⚠ Attention"),
        "note": (colors.HexColor("#F0FDF4"), colors.HexColor("#15803D"), "✔ Note"),
    }
    bg, border, label = colors_map.get(kind, colors_map["tip"])
    st = S("tb", fontSize=9, leading=13, fontName="Helvetica",
           textColor=border)
    t = Table([[Paragraph(f"<b>{label} :</b> {text}", st)]],
              colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1), bg),
        ("BOX",(0,0),(-1,-1), 1, border),
        ("LEFTPADDING",(0,0),(-1,-1), 10),
        ("RIGHTPADDING",(0,0),(-1,-1), 10),
        ("TOPPADDING",(0,0),(-1,-1), 7),
        ("BOTTOMPADDING",(0,0),(-1,-1), 7),
    ]))
    return t

def steps_table(steps):
    rows = []
    for i, s in enumerate(steps, 1):
        num = Table([[Paragraph(f"<b>{i}</b>", S("sn", fontSize=11,
            fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER))]],
            colWidths=[0.7*cm], rowHeights=[0.7*cm])
        num.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1), PRIMARY),
            ("ROUNDEDCORNERS",[6]),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
            ("TOPPADDING",(0,0),(-1,-1), 0),
            ("BOTTOMPADDING",(0,0),(-1,-1), 0),
        ]))
        rows.append([num, Paragraph(s, body)])
    t = Table(rows, colWidths=[0.9*cm, 16.1*cm])
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("LINEBELOW",(0,0),(-1,-1), 0.3, colors.HexColor("#E5E7EB")),
    ]))
    return t

def sec_hdr(num, title, color=PRIMARY):
    return [
        Spacer(1, 0.1*cm),
        Table([[Paragraph(f"{num}  {title}", S("sh", fontSize=18,
            fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_LEFT))]],
            colWidths=[17*cm],
            style=TableStyle([
                ("BACKGROUND",(0,0),(-1,-1), color),
                ("LEFTPADDING",(0,0),(-1,-1), 16),
                ("TOPPADDING",(0,0),(-1,-1), 10),
                ("BOTTOMPADDING",(0,0),(-1,-1), 10),
            ])),
        Spacer(1, 0.25*cm),
    ]

# ══════════════════════════════════════════════════════════════════════════════
# MOCKUP FLOWABLES
# ══════════════════════════════════════════════════════════════════════════════

class MockupBase(Flowable):
    def __init__(self, w=17*cm, h=9*cm):
        Flowable.__init__(self)
        self.width  = w
        self.height = h

    def _bg(self, dark=True):
        c = self.canv
        c.setFillColor(DARK_BG if dark else WHITE)
        c.roundRect(0, 0, self.width, self.height, 6, fill=1, stroke=0)

    def _bar(self, y, h2, color, label="", sub="", icon_char="●", icon_color=None):
        c = self.canv
        c.setFillColor(color)
        c.rect(0, y, self.width, h2, fill=1, stroke=0)
        if label:
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(12, y + h2/2 - 4, label)
        if sub:
            c.setFont("Helvetica", 7)
            c.setFillColor(colors.HexColor("#A5B4FC"))
            c.drawRightString(self.width - 12, y + h2/2 - 3, sub)

    def _card(self, x, y, w, h2, color=None, radius=5, label="", label_color=None, alpha=1):
        c = self.canv
        fill = color or DARK_SURF
        c.setFillColor(fill)
        c.setFillAlpha(alpha)
        c.roundRect(x, y, w, h2, radius, fill=1, stroke=0)
        c.setFillAlpha(1)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.4)
        c.roundRect(x, y, w, h2, radius, fill=0, stroke=1)
        if label:
            c.setFillColor(label_color or GRAY_M)
            c.setFont("Helvetica", 7)
            c.drawString(x+8, y+h2/2-3.5, label)

    def _pill(self, x, y, w, h2, color, text, text_color=None):
        c = self.canv
        c.setFillColor(color)
        c.roundRect(x, y, w, h2, h2/2, fill=1, stroke=0)
        c.setFillColor(text_color or WHITE)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(x + w/2, y + h2/2 - 3, text)

    def _dot(self, x, y, r, color):
        c = self.canv
        c.setFillColor(color)
        c.circle(x, y, r, fill=1, stroke=0)

    def _text(self, x, y, text, size=8, color=WHITE, bold=False, anchor="start"):
        c = self.canv
        c.setFillColor(color)
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        if anchor == "start":
            c.drawString(x, y, text)
        elif anchor == "middle":
            c.drawCentredString(x, y, text)
        else:
            c.drawRightString(x, y, text)

    def _line(self, x1, y1, x2, y2, color=DARK_BDR, w=0.4):
        c = self.canv
        c.setStrokeColor(color)
        c.setLineWidth(w)
        c.line(x1, y1, x2, y2)

    def _sidebar(self, items, active=0):
        c = self.canv
        sb_w = 3.4*cm
        c.setFillColor(DARK_SURF)
        c.rect(0, 0, sb_w, self.height, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.4)
        c.line(sb_w, 0, sb_w, self.height)
        # Logo area
        c.setFillColor(PRIMARY)
        c.roundRect(8, self.height-30, 20, 20, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(12, self.height-22, "SF")
        c.setFillColor(colors.HexColor("#C7D2FE"))
        c.setFont("Helvetica-Bold", 7)
        c.drawString(32, self.height-22, "StockFlow")
        # Nav items
        icons = ["⊞","📦","↔","🏭","🛒","📄","⚙"]
        for i, (label, icon) in enumerate(zip(items, icons)):
            y_pos = self.height - 58 - i*22
            if y_pos < 20: break
            if i == active:
                c.setFillColor(colors.HexColor("#312E81"))
                c.roundRect(6, y_pos-4, sb_w-12, 18, 4, fill=1, stroke=0)
                c.setFillColor(colors.HexColor("#818CF8"))
                c.roundRect(3, y_pos-4, 3, 18, 1, fill=1, stroke=0)
                c.setFillColor(colors.HexColor("#C7D2FE"))
            else:
                c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 7.5)
            c.drawString(14, y_pos+2, label)

    def _topbar(self, title, with_btn=False, btn_label="", btn_color=None):
        c = self.canv
        c.setFillColor(DARK_SURF)
        c.rect(0, self.height-32, self.width, 32, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.4)
        c.line(0, self.height-32, self.width, self.height-32)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(3.8*cm, self.height-20, title)
        if with_btn and btn_label:
            bc = btn_color or PRIMARY
            bw = len(btn_label)*5.5 + 14
            c.setFillColor(bc)
            c.roundRect(self.width-bw-10, self.height-26, bw, 18, 4, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(self.width-bw/2-10, self.height-20, btn_label)
        # User avatar top right
        c.setFillColor(PRIMARY)
        c.circle(self.width-22, self.height-16, 9, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(self.width-22, self.height-19, "AD")

# ── Login Mockup ──────────────────────────────────────────────────────────────
class LoginMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=10*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        # Dark gradient bg
        c.setFillColor(DARK_BG)
        c.roundRect(0, 0, W, H, 6, fill=1, stroke=0)
        # Decorative circle
        c.setFillColor(colors.HexColor("#1E1B4B"))
        c.circle(W*0.85, H*0.7, 70, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#0E0D1A"))
        c.circle(W*0.1, H*0.2, 50, fill=1, stroke=0)
        # Center card
        cw, ch = 5.5*cm, 7.5*cm
        cx = (W - cw)/2
        cy = (H - ch)/2
        c.setFillColor(DARK_SURF)
        c.roundRect(cx, cy, cw, ch, 8, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.5)
        c.roundRect(cx, cy, cw, ch, 8, fill=0, stroke=1)
        # Logo
        c.setFillColor(PRIMARY)
        c.roundRect(cx + cw/2 - 14, cy + ch - 32, 28, 24, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(cx + cw/2, cy + ch - 22, "SF")
        # Title
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(cx + cw/2, cy + ch - 48, "StockFlow")
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7)
        c.drawCentredString(cx + cw/2, cy + ch - 60, "Connectez-vous à votre compte")
        # Email field
        fy = cy + ch - 90
        c.setFillColor(DARK_SURF2)
        c.roundRect(cx+12, fy, cw-24, 16, 4, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.4)
        c.roundRect(cx+12, fy, cw-24, 16, 4, fill=0, stroke=1)
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7)
        c.drawString(cx+18, fy+5, "Email")
        # Password field
        py = fy - 24
        c.setFillColor(DARK_SURF2)
        c.roundRect(cx+12, py, cw-24, 16, 4, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.roundRect(cx+12, py, cw-24, 16, 4, fill=0, stroke=1)
        c.setFillColor(GRAY_M)
        c.drawString(cx+18, py+5, "Mot de passe")
        # Submit button
        by = py - 24
        c.setFillColor(PRIMARY)
        c.roundRect(cx+12, by, cw-24, 16, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(cx + cw/2, by+5, "Se connecter")
        # Forgot
        c.setFillColor(PLT)
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(cx + cw/2, by - 10, "Mot de passe oublié ?")

# ── Dashboard Mockup ──────────────────────────────────────────────────────────
class DashboardMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=11*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        NAV = ["Tableau de bord","Inventaire","Mouvements","Entrepôts","Achats","Ventes","Paramètres"]
        self._sidebar(NAV, active=0)
        self._topbar("Tableau de bord", with_btn=True, btn_label="+ Mouvement")
        sb = 3.4*cm
        cx = sb + 8
        cw = W - sb - 16
        # Greeting
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7)
        c.drawString(cx, H-46, "Bonjour,")
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(cx, H-57, "Administrateur 👋")
        # KPI cards row
        kpi = [
            ("Articles", "248", PRIMARY),
            ("Stock faible", "12", AMBER),
            ("Mouvements", "34", TEAL),
            ("Entrepôts", "3", VIOLET),
        ]
        kw = (cw - 12) / 4
        for i, (label, val, col) in enumerate(kpi):
            kx = cx + i*(kw+4)
            ky = H - 110
            c.setFillColor(DARK_SURF)
            c.roundRect(kx, ky, kw, 42, 5, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.setLineWidth(0.4)
            c.roundRect(kx, ky, kw, 42, 5, fill=0, stroke=1)
            c.setFillColor(col)
            c.roundRect(kx+6, ky+27, 16, 12, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(kx+6, ky+12, val)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawString(kx+6, ky+4, label)
        # Quick actions
        c.setFillColor(colors.HexColor("#C7D2FE"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(cx, H-120, "Actions rapides")
        aw = (cw - 8) / 3
        for i, (lbl, col) in enumerate([("+ Mouvement",PRIMARY),("Articles",TEAL),("Inventaire",VIOLET)]):
            ax = cx + i*(aw+4)
            ay = H - 152
            c.setFillColor(DARK_SURF)
            c.roundRect(ax, ay, aw, 24, 5, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.roundRect(ax, ay, aw, 24, 5, fill=0, stroke=1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(ax+aw/2, ay+9, lbl)
        # Recent movements header
        c.setFillColor(colors.HexColor("#C7D2FE"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(cx, H-165, "Mouvements récents")
        c.setFillColor(PLT)
        c.setFont("Helvetica", 7)
        c.drawRightString(cx+cw, H-165, "Voir tout →")
        # Movement rows
        mvts = [("MOV-A1B2C3D4","TRANSFER","Completed"),("MOV-E5F6G7H8","RECEIPT","Completed"),("MOV-I9J0K1L2","ISSUE","Pending")]
        for i,(ref,typ,status) in enumerate(mvts):
            my = H - 185 - i*18
            c.setFillColor(DARK_SURF)
            c.roundRect(cx, my, cw, 14, 3, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.roundRect(cx, my, cw, 14, 3, fill=0, stroke=1)
            c.setFillColor(TEAL)
            c.roundRect(cx+4, my+2, 10, 10, 2, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 5.5)
            c.drawCentredString(cx+9, my+5, "↔")
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            c.drawString(cx+18, my+4.5, ref)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6.5)
            c.drawString(cx+80, my+4.5, typ)
            sc = SUCCESS if status=="Completed" else AMBER
            c.setFillColor(sc)
            c.roundRect(cx+cw-52, my+2, 48, 10, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 6)
            c.drawCentredString(cx+cw-28, my+5.5, status)

# ── Inventory Mockup ──────────────────────────────────────────────────────────
class InventoryMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=11*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        NAV = ["Tableau de bord","Inventaire","Mouvements","Entrepôts","Achats","Ventes","Paramètres"]
        self._sidebar(NAV, active=1)
        self._topbar("Inventaire")
        sb = 3.4*cm
        cx = sb + 8
        cw = W - sb - 16
        # Stats chart card
        c.setFillColor(DARK_SURF)
        c.roundRect(cx, H-115, cw, 70, 6, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.roundRect(cx, H-115, cw, 70, 6, fill=0, stroke=1)
        # big number
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(cx+10, H-80, "248")
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 6.5)
        c.drawString(cx+10, H-88, "Total Articles")
        # legend
        for i,(lbl,col,pct) in enumerate([("En stock",SUCCESS,"82%"),("Faible",AMBER,"10%"),("Rupture",DANGER,"8%")]):
            lx = cx+cw-130 + i*44
            c.setFillColor(col)
            c.circle(lx, H-68, 3, fill=1, stroke=0)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 5.5)
            c.drawString(lx+5, H-70, lbl)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 7)
            c.drawString(lx+5, H-78, pct)
        # segmented bar
        bx, by, bw, bh = cx+10, H-98, cw-20, 6
        segs = [(0.82, SUCCESS),(0.10, AMBER),(0.08, DANGER)]
        xx = bx
        for pct, col in segs:
            sw = bw * pct - 2
            c.setFillColor(col)
            c.roundRect(xx, by, sw, bh, 3, fill=1, stroke=0)
            xx += sw + 2
        # count chips
        for i,(n,lbl,col) in enumerate([(204,"En stock",SUCCESS),(25,"Faible",AMBER),(19,"Rupture",DANGER)]):
            chx = cx+10 + i*(cw-20)/3
            chw = (cw-24)/3
            c.setFillColor(col)
            c.setFillAlpha(0.1)
            c.roundRect(chx, H-115+4, chw, 14, 3, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(chx+chw/2, H-106, str(n))
            c.setFont("Helvetica", 5.5)
            c.drawCentredString(chx+chw/2, H-115+5.5, lbl)
        # Search bar
        c.setFillColor(DARK_SURF)
        c.roundRect(cx, H-130, cw, 12, 4, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.roundRect(cx, H-130, cw, 12, 4, fill=0, stroke=1)
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7)
        c.drawString(cx+8, H-125, "🔍  Rechercher par nom ou SKU…")
        # Group header - IN STOCK
        c.setFillColor(colors.HexColor("#052E16"))
        c.roundRect(cx, H-148, cw, 14, 5, fill=1, stroke=0)
        c.setFillColor(SUCCESS)
        c.roundRect(cx, H-148, cw, 14, 5, fill=0, stroke=1)
        c.setFillColor(SUCCESS)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(cx+26, H-143, "En stock")
        c.setFillColor(SUCCESS)
        c.circle(cx+14, H-141, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 5)
        c.drawCentredString(cx+14, H-143, "✔")
        # pill count
        c.setFillColor(SUCCESS)
        c.roundRect(cx+cw-28, H-146, 20, 10, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(cx+cw-18, H-142, "204")
        # Item rows
        items_data = [
            ("Eco-friendly Cereal Box", "SMA-F00-0012", "50", "100%", SUCCESS),
            ("Wireless Headphones Pro", "ELC-HP-0034",  "23", "76%",  SUCCESS),
            ("Office Chair Premium",    "FRN-CH-0089",  "8",  "26%",  SUCCESS),
        ]
        for i,(name,sku,qty,pct,col) in enumerate(items_data):
            ry = H - 167 - i*18
            if ry < 10: break
            # row bg
            c.setFillColor(DARK_SURF)
            c.rect(cx, ry, cw, 17, fill=1, stroke=0)
            if i > 0:
                c.setStrokeColor(DARK_BDR)
                c.setLineWidth(0.3)
                c.line(cx+16, ry+17, cx+cw, ry+17)
            # accent strip
            c.setFillColor(col)
            c.rect(cx, ry, 3, 17, fill=1, stroke=0)
            # avatar
            c.setFillColor(col)
            c.setFillAlpha(0.15)
            c.roundRect(cx+8, ry+2, 13, 13, 3, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(cx+14, ry+7, name[0])
            # name + sku
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            c.drawString(cx+25, ry+10, name[:22])
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawString(cx+25, ry+3, sku)
            # qty + bar
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 8)
            c.drawRightString(cx+cw-4, ry+11, qty)
            # mini bar
            bary = ry + 5
            c.setFillColor(col)
            c.setFillAlpha(0.15)
            c.roundRect(cx+cw-38, bary, 32, 3, 1, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(col)
            pct_f = int(pct.replace("%",""))/100
            c.roundRect(cx+cw-38, bary, 32*pct_f, 3, 1, fill=1, stroke=0)
            c.setFillColor(col)
            c.setFont("Helvetica", 5)
            c.drawRightString(cx+cw-4, bary, pct)

# ── Movements Mockup ──────────────────────────────────────────────────────────
class MovementsMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=11*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        NAV = ["Tableau de bord","Inventaire","Mouvements","Entrepôts","Achats","Ventes","Paramètres"]
        self._sidebar(NAV, active=2)
        self._topbar("Mouvements", with_btn=True, btn_label="+ Nouveau")
        sb = 3.4*cm
        cx = sb + 8
        cw = W - sb - 16
        # Filter chips
        chips = [("Tous",PRIMARY,True),("RECEIPT",TEAL,False),("TRANSFER",AMBER,False),("ISSUE",DANGER,False)]
        chx = cx
        for lbl, col, sel in chips:
            chw = len(lbl)*5.5+16
            bg = col if sel else DARK_SURF
            c.setFillColor(bg)
            c.roundRect(chx, H-54, chw, 14, 7, fill=1, stroke=0)
            if not sel:
                c.setStrokeColor(DARK_BDR)
                c.setLineWidth(0.4)
                c.roundRect(chx, H-54, chw, 14, 7, fill=0, stroke=1)
            c.setFillColor(WHITE if sel else GRAY_M)
            c.setFont("Helvetica-Bold" if sel else "Helvetica", 6.5)
            c.drawCentredString(chx+chw/2, H-48, lbl)
            chx += chw + 6
        # Movement cards
        mvts = [
            ("MOV-A1B2C3D4","TRANSFER","2025-06-15","Entrepôt A → Entrepôt B","Completed",SUCCESS),
            ("MOV-E5F6G7H8","RECEIPT", "2025-06-14","Réception fournisseur","Completed",SUCCESS),
            ("MOV-I9J0K1L2","ISSUE",   "2025-06-14","Sortie commande client", "Pending",  AMBER),
            ("MOV-M3N4O5P6","ADJUSTMENT","2025-06-13","Correction inventaire","In Progress",PLT),
        ]
        for i,(ref,typ,date,desc,status,scol) in enumerate(mvts):
            my = H - 80 - i*22
            if my < 10: break
            c.setFillColor(DARK_SURF)
            c.roundRect(cx, my, cw, 18, 4, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.setLineWidth(0.3)
            c.roundRect(cx, my, cw, 18, 4, fill=0, stroke=1)
            # type icon
            type_colors = {"TRANSFER":TEAL,"RECEIPT":SUCCESS,"ISSUE":DANGER,"ADJUSTMENT":AMBER}
            ic = type_colors.get(typ, PRIMARY)
            c.setFillColor(ic)
            c.setFillAlpha(0.15)
            c.roundRect(cx+4, my+3, 12, 12, 3, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(ic)
            c.setFont("Helvetica-Bold", 6)
            c.drawCentredString(cx+10, my+7.5, "↔")
            # ref + desc
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            c.drawString(cx+20, my+11, ref)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawString(cx+20, my+4, desc[:30])
            # date
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawString(cx+110, my+11, date)
            # type pill
            c.setFillColor(ic)
            c.setFillAlpha(0.15)
            tw = len(typ)*4.5+8
            c.roundRect(cx+cw-tw-56, my+4, tw, 10, 3, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(ic)
            c.setFont("Helvetica-Bold", 5.5)
            c.drawCentredString(cx+cw-tw/2-56, my+7.5, typ)
            # status
            c.setFillColor(scol)
            sw2 = 48
            c.roundRect(cx+cw-sw2, my+4, sw2, 10, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 5.5)
            c.drawCentredString(cx+cw-sw2/2, my+7.5, status)

# ── Create Movement Mockup ────────────────────────────────────────────────────
class CreateMovementMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=12*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        # Form card centered
        fw, fh = 10*cm, 10.5*cm
        fx = (W-fw)/2
        fy = (H-fh)/2
        c.setFillColor(DARK_SURF)
        c.roundRect(fx, fy, fw, fh, 8, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.5)
        c.roundRect(fx, fy, fw, fh, 8, fill=0, stroke=1)
        # Header
        c.setFillColor(PRIMARY)
        c.roundRect(fx, fy+fh-28, fw, 28, 8, fill=1, stroke=0)
        c.roundRect(fx, fy+fh-14, fw, 14, 0, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(fx+12, fy+fh-18, "Nouveau Mouvement")
        # Type grid
        types = [("RECEIPT",SUCCESS),("ISSUE",DANGER),("TRANSFER",TEAL),("ADJUSTMENT",AMBER)]
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(fx+10, fy+fh-40, "TYPE DE MOUVEMENT")
        for i,(typ,col) in enumerate(types):
            tx = fx+10 + (i%2)*(fw/2-12)
            ty = fy+fh-60 - (i//2)*18
            sel = i==2
            c.setFillColor(col if sel else DARK_SURF2)
            c.setFillAlpha(0.15 if sel else 1)
            c.roundRect(tx, ty, fw/2-14, 15, 4, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setStrokeColor(col if sel else DARK_BDR)
            c.setLineWidth(0.8 if sel else 0.3)
            c.roundRect(tx, ty, fw/2-14, 15, 4, fill=0, stroke=1)
            c.setFillColor(col if sel else GRAY_M)
            c.setFont("Helvetica-Bold", 6.5)
            c.drawString(tx+6, ty+5, typ)
        # Warehouse dropdown
        dy = fy+fh-105
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(fx+10, dy+2, "ENTREPÔT")
        dy -= 16
        c.setFillColor(DARK_SURF2)
        c.roundRect(fx+10, dy, fw-20, 13, 4, fill=1, stroke=0)
        c.setStrokeColor(PLT)
        c.setLineWidth(0.6)
        c.roundRect(fx+10, dy, fw-20, 13, 4, fill=0, stroke=1)
        c.setFillColor(colors.HexColor("#C7D2FE"))
        c.setFont("Helvetica", 7)
        c.drawString(fx+16, dy+4, "Entrepôt Principal - Paris")
        c.drawRightString(fx+fw-14, dy+4, "▾")
        # Src/Dst location
        ldy = dy - 20
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(fx+10, ldy+2, "EMPLACEMENTS")
        ldy -= 16
        for label, sel_text, color in [("Source", "Zone A - Rack 01", AMBER),("Destination", "Zone B - Rack 03", SUCCESS)]:
            c.setFillColor(DARK_SURF2)
            c.roundRect(fx+10, ldy, fw-20, 13, 4, fill=1, stroke=0)
            c.setStrokeColor(color)
            c.setLineWidth(0.5)
            c.roundRect(fx+10, ldy, fw-20, 13, 4, fill=0, stroke=1)
            c.setFillColor(color)
            c.setFont("Helvetica", 7)
            c.drawString(fx+16, ldy+4, f"{label}: {sel_text}")
            c.drawRightString(fx+fw-14, ldy+4, "▾")
            ldy -= 17
        # Article
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(fx+10, ldy+2, "ARTICLE & QUANTITÉ")
        ldy -= 16
        c.setFillColor(DARK_SURF2)
        c.roundRect(fx+10, ldy, fw-50, 13, 4, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.roundRect(fx+10, ldy, fw-50, 13, 4, fill=0, stroke=1)
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7)
        c.drawString(fx+16, ldy+4, "Wireless Headphones Pro")
        c.setFillColor(DARK_SURF2)
        c.roundRect(fx+fw-38, ldy, 28, 13, 4, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.roundRect(fx+fw-38, ldy, 28, 13, 4, fill=0, stroke=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(fx+fw-24, ldy+4.5, "5")
        # Submit
        by = fy + 14
        c.setFillColor(PRIMARY)
        c.roundRect(fx+10, by, fw-20, 16, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(fx+fw/2, by+5.5, "Créer le Mouvement")

# ── Items Mockup ──────────────────────────────────────────────────────────────
class ItemsMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=10*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        NAV = ["Tableau de bord","Inventaire","Mouvements","Entrepôts","Achats","Ventes","Paramètres"]
        self._sidebar(NAV, active=1)
        self._topbar("Articles", with_btn=True, btn_label="+ Article")
        sb = 3.4*cm
        cx = sb + 8
        cw = W - sb - 16
        # Search
        c.setFillColor(DARK_SURF)
        c.roundRect(cx, H-52, cw*0.6, 13, 4, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.roundRect(cx, H-52, cw*0.6, 13, 4, fill=0, stroke=1)
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7)
        c.drawString(cx+8, H-47, "🔍 Rechercher…")
        # Table header
        cols = [("Article",0.35),("SKU",0.15),("Catégorie",0.15),("Prix",0.12),("Stock",0.12),("Statut",0.11)]
        hx = cx
        c.setFillColor(PRIMARY)
        c.roundRect(cx, H-72, cw, 15, 4, fill=1, stroke=0)
        for lbl, pct in cols:
            cw2 = cw*pct
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 6.5)
            c.drawString(hx+4, H-66, lbl)
            hx += cw2
        # Data rows
        items = [
            ("Eco-friendly Cereal Box","SMA-F00-0012","Alimentaire","12,90 €","50","In Stock",SUCCESS),
            ("Wireless Headphones Pro","ELC-HP-0034","Électronique","189,00 €","23","In Stock",SUCCESS),
            ("Office Chair Premium","FRN-CH-0089","Mobilier","349,00 €","8","Low Stock",AMBER),
            ("USB-C Hub 7-Port","ELC-USB-007","Électronique","49,90 €","0","Out of Stock",DANGER),
        ]
        for i,(name,sku,cat,price,qty,status,scol) in enumerate(items):
            ry = H - 88 - i*16
            if ry < 8: break
            bg = DARK_SURF if i%2==0 else DARK_SURF2
            c.setFillColor(bg)
            c.rect(cx, ry, cw, 15, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.setLineWidth(0.2)
            c.line(cx, ry, cx+cw, ry)
            row_vals = [name[:18],sku,cat,price,qty]
            hx = cx
            for j,(val,(_,pct)) in enumerate(zip(row_vals,cols)):
                c.setFillColor(WHITE if j==0 else GRAY_M)
                c.setFont("Helvetica-Bold" if j==0 else "Helvetica", 6.5)
                c.drawString(hx+4, ry+4.5, val)
                hx += cw*pct
            # status pill
            c.setFillColor(scol)
            sw2 = len(status)*4.2+8
            c.roundRect(cx+cw-sw2-4, ry+3, sw2, 9, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 5.5)
            c.drawCentredString(cx+cw-sw2/2-4, ry+6, status)

# ── Purchases Mockup ──────────────────────────────────────────────────────────
class PurchasesMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=10*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        NAV = ["Tableau de bord","Inventaire","Mouvements","Entrepôts","Achats","Ventes","Paramètres"]
        self._sidebar(NAV, active=4)
        self._topbar("Bons de commande", with_btn=True, btn_label="+ Bon de commande")
        sb = 3.4*cm
        cx = sb + 8
        cw = W - sb - 16
        # KPI mini row
        kpis = [("Total BC","18",PRIMARY),("En attente","5",AMBER),("Reçus","11",SUCCESS),("Annulés","2",DANGER)]
        kw2 = (cw-12)/4
        for i,(lbl,val,col) in enumerate(kpis):
            kx = cx + i*(kw2+4)
            c.setFillColor(DARK_SURF)
            c.roundRect(kx, H-65, kw2, 26, 4, fill=1, stroke=0)
            c.setStrokeColor(col)
            c.setLineWidth(0.5)
            c.roundRect(kx, H-65, kw2, 26, 4, fill=0, stroke=1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(kx+kw2/2, H-53, val)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawCentredString(kx+kw2/2, H-64, lbl)
        # Table header
        c.setFillColor(PRIMARY)
        c.roundRect(cx, H-83, cw, 13, 3, fill=1, stroke=0)
        for j,(hdr,x_off) in enumerate([("Référence",4),("Fournisseur",55),("Date",120),("Total",158),("Statut",190)]):
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 6.5)
            c.drawString(cx+x_off, H-78, hdr)
        orders = [
            ("BC-2025-001","Acme Supplies","12/06/2025","1 240,00 €","Reçu",SUCCESS),
            ("BC-2025-002","Tech Import","13/06/2025","890,00 €","En attente",AMBER),
            ("BC-2025-003","Global Parts","14/06/2025","3 150,00 €","Confirmé",PLT),
            ("BC-2025-004","Euro Distrib","15/06/2025","670,00 €","Envoyé",TEAL),
        ]
        for i,(ref,fournisseur,date,total,status,scol) in enumerate(orders):
            ry = H-98-i*16
            if ry < 8: break
            c.setFillColor(DARK_SURF if i%2==0 else DARK_SURF2)
            c.rect(cx, ry, cw, 14, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.setLineWidth(0.2)
            c.line(cx, ry, cx+cw, ry)
            for val, x_off, bold in [(ref,4,True),(fournisseur,55,False),(date,120,False),(total,158,False)]:
                c.setFillColor(WHITE if bold else GRAY_M)
                c.setFont("Helvetica-Bold" if bold else "Helvetica", 6.5)
                c.drawString(cx+x_off, ry+4, val)
            c.setFillColor(scol)
            sw2 = len(status)*4+10
            c.roundRect(cx+cw-sw2-4, ry+2.5, sw2, 9, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 5.5)
            c.drawCentredString(cx+cw-sw2/2-4, ry+6, status)

# ── Profile Mockup ────────────────────────────────────────────────────────────
class ProfileMockup(MockupBase):
    def __init__(self): super().__init__(w=17*cm, h=10*cm)
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._bg()
        NAV = ["Tableau de bord","Inventaire","Mouvements","Entrepôts","Achats","Ventes","Paramètres"]
        self._sidebar(NAV, active=6)
        self._topbar("Profil & Paramètres")
        sb = 3.4*cm
        cx = sb + 8
        cw = W - sb - 16
        # Profile banner
        c.setFillColor(PRIMARY)
        c.setFillAlpha(0.15)
        c.roundRect(cx, H-100, cw, 60, 6, fill=1, stroke=0)
        c.setFillAlpha(1)
        # Avatar
        c.setFillColor(PRIMARY)
        c.circle(cx+40, H-75, 24, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(cx+40, H-80, "AD")
        # Name + role
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(cx+72, H-62, "Admin User")
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 7.5)
        c.drawString(cx+72, H-72, "admin@stockflow.com")
        # Role badge
        c.setFillColor(PRIMARY)
        c.roundRect(cx+72, H-86, 40, 11, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(cx+92, H-82, "ADMIN")
        # Active badge
        c.setFillColor(SUCCESS)
        c.roundRect(cx+116, H-86, 36, 11, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(cx+134, H-82, "● Actif")
        # Stats row
        for i,(val,lbl) in enumerate([(248,"Articles"),(34,"Mouvements"),(3,"Entrepôts")]):
            sx = cx + i*(cw/3)
            c.setFillColor(DARK_SURF)
            c.roundRect(sx, H-122, cw/3-6, 18, 4, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.roundRect(sx, H-122, cw/3-6, 18, 4, fill=0, stroke=1)
            c.setFillColor(PRIMARY)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(sx+cw/6-3, H-110, str(val))
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawCentredString(sx+cw/6-3, H-121, lbl)
        # Settings list
        items_list = [
            ("Informations du compte", "Modifier nom, email, photo", PLT),
            ("Sécurité", "Changer le mot de passe", AMBER),
            ("Notifications", "Alertes email et push", SUCCESS),
            ("Apparence", "Thème sombre / clair", VIOLET),
        ]
        for i,(title,sub,col) in enumerate(items_list):
            iy = H - 143 - i*17
            if iy < 8: break
            c.setFillColor(DARK_SURF)
            c.roundRect(cx, iy, cw, 14, 4, fill=1, stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.setLineWidth(0.3)
            c.roundRect(cx, iy, cw, 14, 4, fill=0, stroke=1)
            c.setFillColor(col)
            c.circle(cx+11, iy+7, 4, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 6.5)
            c.drawString(cx+20, iy+8, title)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 6)
            c.drawString(cx+20, iy+2, sub)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 8)
            c.drawRightString(cx+cw-6, iy+6, "›")

# ── Mobile Mockups ────────────────────────────────────────────────────────────
class MobileMockupBase(Flowable):
    def __init__(self, w=5.5*cm, h=11*cm):
        Flowable.__init__(self)
        self.width  = w
        self.height = h

    def _phone_frame(self):
        c = self.canv
        W, H = self.width, self.height
        c.setFillColor(colors.HexColor("#1A1A2E"))
        c.roundRect(0, 0, W, H, 14, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#3A3A5C"))
        c.setLineWidth(1.5)
        c.roundRect(0, 0, W, H, 14, fill=0, stroke=1)
        # Notch
        c.setFillColor(colors.HexColor("#0D0D1A"))
        c.roundRect(W/2-18, H-14, 36, 10, 4, fill=1, stroke=0)
        # Status bar
        c.setFillColor(DARK_BG)
        c.rect(1, H-22, W-2, 8, fill=1, stroke=0)
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 5)
        c.drawString(6, H-19, "9:41")
        c.drawRightString(W-6, H-19, "●●● WiFi 🔋")

    def _tab_bar(self, items, active=0):
        c = self.canv
        W = self.width
        c.setFillColor(DARK_SURF)
        c.roundRect(0, 0, W, 28, 0, fill=1, stroke=0)
        c.setStrokeColor(DARK_BDR)
        c.setLineWidth(0.4)
        c.line(0, 28, W, 28)
        tw = W / len(items)
        for i, (label, icon) in enumerate(items):
            tx = i*tw + tw/2
            col = PRIMARY if i==active else GRAY_M
            c.setFillColor(col)
            c.setFont("Helvetica-Bold" if i==active else "Helvetica", 5)
            c.drawCentredString(tx, 8, label)
            c.setFont("Helvetica", 9)
            c.drawCentredString(tx, 16, icon)

class MobileDashboard(MobileMockupBase):
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._phone_frame()
        c.setFillColor(DARK_BG)
        c.rect(1, 28, W-2, H-50, fill=1, stroke=0)
        # Greeting
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 6)
        c.drawString(8, H-32, "Bonjour,")
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(8, H-42, "Admin 👋")
        # KPI 2x2 grid
        kw = (W-18)/2
        kh = 22
        for i,(lbl,val,col) in enumerate([(("Articles","248",PRIMARY),("Faible","12",AMBER),("Mvts","34",TEAL),("Entrepôts","3",VIOLET))[j] for j in range(4)]):
            kx = 8 + (i%2)*(kw+4)
            ky = H-74 - (i//2)*(kh+4)
            c.setFillColor(DARK_SURF)
            c.roundRect(kx, ky, kw, kh, 4, fill=1, stroke=0)
            c.setStrokeColor(col)
            c.setLineWidth(0.4)
            c.roundRect(kx, ky, kw, kh, 4, fill=0, stroke=1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(kx+5, ky+12, val)
            c.setFillColor(GRAY_M)
            c.setFont("Helvetica", 5.5)
            c.drawString(kx+5, ky+4, lbl)
        # Recent mvts
        c.setFillColor(colors.HexColor("#C7D2FE"))
        c.setFont("Helvetica-Bold", 7)
        c.drawString(8, H-128, "Mouvements récents")
        for i,(ref,st,scol) in enumerate([("MOV-A1B2C3D4","Completed",SUCCESS),("MOV-E5F6G7H8","Pending",AMBER)]):
            ry = H-143-i*18
            c.setFillColor(DARK_SURF)
            c.roundRect(8, ry, W-16, 14, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 6)
            c.drawString(12, ry+8, ref)
            c.setFillColor(scol)
            sw=36
            c.roundRect(W-sw-10, ry+2.5, sw, 9, 3, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 5)
            c.drawCentredString(W-sw/2-10, ry+5.5, st)
        TABS = [("Accueil","⊞"),("Inventaire","📦"),("Mvts","↔"),("Achats","🛒"),("Profil","👤")]
        self._tab_bar(TABS, active=0)

class MobileInventory(MobileMockupBase):
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._phone_frame()
        c.setFillColor(DARK_BG)
        c.rect(1, 28, W-2, H-50, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(8, H-34, "Inventaire")
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 6)
        c.drawString(8, H-43, "Stock en temps réel")
        # Stats chart card
        c.setFillColor(DARK_SURF)
        c.roundRect(8, H-92, W-16, 44, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(12, H-66, "248")
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 5.5)
        c.drawString(12, H-73, "Total Articles")
        bx,by,bw,bh = 8,H-80,W-16,4
        for pct,col in [(0.82,SUCCESS),(0.10,AMBER),(0.08,DANGER)]:
            sw=bw*pct-1
            c.setFillColor(col)
            c.roundRect(bx,by,sw,bh,2,fill=1,stroke=0)
            bx+=sw+1
        for i,(n,lbl,col) in enumerate([(204,"Stock",SUCCESS),(25,"Faible",AMBER),(19,"Rupture",DANGER)]):
            chx = 8+i*(W-16)/3
            chw=(W-16)/3-2
            c.setFillColor(col)
            c.setFillAlpha(0.1)
            c.roundRect(chx,H-92+4,chw,12,3,fill=1,stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold",8)
            c.drawCentredString(chx+chw/2,H-84,str(n))
            c.setFont("Helvetica",5)
            c.drawCentredString(chx+chw/2,H-92+5,lbl)
        # Group header
        c.setFillColor(colors.HexColor("#052E16"))
        c.roundRect(8,H-108,W-16,12,4,fill=1,stroke=0)
        c.setFillColor(SUCCESS)
        c.setFont("Helvetica-Bold",7)
        c.drawString(20,H-103,"En stock")
        c.circle(14,H-102,3.5,fill=1,stroke=0)
        # Items
        for i,(name,qty,pct,col) in enumerate([("Cereal Box 0012","50","100%",SUCCESS),("Headphones Pro","23","76%",SUCCESS)]):
            ry=H-124-i*20
            c.setFillColor(DARK_SURF)
            c.rect(8,ry,W-16,18,fill=1,stroke=0)
            c.setFillColor(col)
            c.rect(8,ry,2,18,fill=1,stroke=0)
            c.setFillColor(col)
            c.setFillAlpha(0.15)
            c.roundRect(12,ry+2,12,14,3,fill=1,stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold",7)
            c.drawCentredString(18,ry+7.5,name[0])
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold",6.5)
            c.drawString(27,ry+11,name[:14])
            c.setFillColor(col)
            c.setFont("Helvetica-Bold",8)
            c.drawRightString(W-10,ry+13,qty)
            bw2=W-16-20
            c.setFillColor(col)
            c.setFillAlpha(0.12)
            c.roundRect(8,ry,bw2,3,1,fill=1,stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(col)
            pf=int(pct.replace("%",""))/100
            c.roundRect(8,ry,bw2*pf,3,1,fill=1,stroke=0)
        TABS=[("Accueil","⊞"),("Inventaire","📦"),("Mvts","↔"),("Achats","🛒"),("Profil","👤")]
        self._tab_bar(TABS,active=1)

class MobileProfile(MobileMockupBase):
    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        self._phone_frame()
        c.setFillColor(DARK_BG)
        c.rect(1, 28, W-2, H-50, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(W/2, H-34, "Paramètres")
        # User card
        c.setFillColor(DARK_SURF)
        c.roundRect(8, H-92, W-16, 50, 6, fill=1, stroke=0)
        c.setFillColor(PRIMARY)
        c.circle(W/2, H-62, 16, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(W/2, H-66, "AD")
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(W/2, H-82, "Admin User")
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica", 6)
        c.drawCentredString(W/2, H-90, "admin@stockflow.com")
        # Settings items
        settings = [
            ("Profil", PLT),
            ("Mot de passe", AMBER),
            ("Notifications", SUCCESS),
            ("Mode sombre", VIOLET),
        ]
        for i,(lbl,col) in enumerate(settings):
            iy = H-110-i*18
            c.setFillColor(DARK_SURF)
            c.roundRect(8,iy,W-16,15,4,fill=1,stroke=0)
            c.setStrokeColor(DARK_BDR)
            c.setLineWidth(0.3)
            c.roundRect(8,iy,W-16,15,4,fill=0,stroke=1)
            c.setFillColor(col)
            c.circle(16,iy+7.5,4,fill=1,stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold",7)
            c.drawString(24,iy+4.5,lbl)
            c.setFillColor(GRAY_M)
            c.drawRightString(W-10,iy+4.5,"›")
        # About card
        iy = H-110-4*18-4
        c.setFillColor(DARK_SURF)
        c.roundRect(8,iy,W-16,15,4,fill=1,stroke=0)
        c.setFillColor(GRAY_M)
        c.setFont("Helvetica",6.5)
        c.drawCentredString(W/2,iy+4.5,"À propos de StockFlow")
        # Logout
        iy2=iy-20
        c.setFillColor(colors.HexColor("#1A0A0E"))
        c.roundRect(8,iy2,W-16,15,4,fill=1,stroke=0)
        c.setStrokeColor(DANGER)
        c.setLineWidth(0.5)
        c.roundRect(8,iy2,W-16,15,4,fill=0,stroke=1)
        c.setFillColor(DANGER)
        c.setFont("Helvetica-Bold",7)
        c.drawCentredString(W/2,iy2+4.5,"Se déconnecter")
        TABS=[("Accueil","⊞"),("Inventaire","📦"),("Mvts","↔"),("Achats","🛒"),("Profil","👤")]
        self._tab_bar(TABS,active=4)

# ── Caption helper ────────────────────────────────────────────────────────────
def mockup_with_caption(mockup, caption_text):
    t = Table([[mockup],[Paragraph(caption_text, cap)]],
              colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ("TOPPADDING",(0,0),(-1,-1),4),
        ("BOTTOMPADDING",(0,0),(-1,-1),4),
    ]))
    return t

def three_phones(m1, m2, m3, caps):
    t = Table([[m1, m2, m3],[
        Paragraph(caps[0], cap),
        Paragraph(caps[1], cap),
        Paragraph(caps[2], cap),
    ]], colWidths=[5.5*cm, 5.5*cm, 5.5*cm])
    t.setStyle(TableStyle([
        ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),4),
        ("TOPPADDING",(0,0),(-1,-1),4),
        ("BOTTOMPADDING",(0,0),(-1,-1),4),
    ]))
    return t

# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENT ASSEMBLY
# ══════════════════════════════════════════════════════════════════════════════

def on_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, h-0.8*cm, w, 0.8*cm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(1*cm, h-0.55*cm, "StockFlow — Guide d'Utilisation")
    canvas.drawRightString(w-1*cm, h-0.55*cm, "v1.0 — 2025")
    canvas.setFillColor(GRAY_L)
    canvas.rect(0, 0, w, 0.7*cm, fill=1, stroke=0)
    canvas.setFillColor(GRAY_M)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(1*cm, 0.22*cm, "© 2025 StockFlow")
    canvas.drawCentredString(w/2, 0.22*cm, f"Page {doc.page}")
    canvas.drawRightString(w-1*cm, 0.22*cm, "Guide Web & Mobile")
    canvas.restoreState()

def build_cover():
    e = []
    e.append(Spacer(1, 2*cm))
    # Big gradient title block
    t = Table([[Paragraph("Guide d'Utilisation", S("cv", fontSize=32,
        fontName="Helvetica-Bold", textColor=DARK, alignment=TA_CENTER))]],
        colWidths=[17*cm])
    e.append(t)
    e.append(Spacer(1, 0.3*cm))
    t2 = Table([[Paragraph("Application Web &amp; Mobile", S("cv2", fontSize=16,
        fontName="Helvetica", textColor=GRAY_M, alignment=TA_CENTER))]],
        colWidths=[17*cm])
    e.append(t2)
    e.append(Spacer(1, 0.6*cm))
    e.append(hr(PRIMARY, 2))
    e.append(Spacer(1, 0.5*cm))
    meta = [
        ("Produit",    "StockFlow — Système de Gestion de Stock"),
        ("Version",    "1.0"),
        ("Date",       "Juin 2025"),
        ("Audience",   "Utilisateurs finaux (gestionnaires, opérateurs, administrateurs)"),
        ("Plateformes","Web (navigateur) · Android · iOS"),
    ]
    from reportlab.lib.styles import ParagraphStyle as PS
    data = [[Paragraph(f"<b>{k}</b>", S("mk", fontSize=10, fontName="Helvetica-Bold",
             textColor=DARK)), Paragraph(v, body)] for k,v in meta]
    mt = Table(data, colWidths=[5*cm, 12*cm])
    mt.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(0,-1), GRAY_L),
        ("GRID",(0,0),(-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),8),
        ("RIGHTPADDING",(0,0),(-1,-1),8),
        ("TOPPADDING",(0,0),(-1,-1),6),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    e.append(mt)
    e.append(Spacer(1, 0.8*cm))
    intro = Table([[Paragraph(
        "Ce guide présente les fonctionnalités de la plateforme StockFlow à travers des captures "
        "d'écran annotées et des instructions pas-à-pas. Il couvre l'ensemble des modules disponibles "
        "sur l'application web et l'application mobile.",
        S("intr", fontSize=10, leading=15, textColor=DARK, fontName="Helvetica", alignment=TA_JUSTIFY)
    )]], colWidths=[17*cm])
    intro.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1), INDIGO_BG),
        ("BOX",(0,0),(-1,-1), 1.5, PRIMARY),
        ("LEFTPADDING",(0,0),(-1,-1),14),
        ("RIGHTPADDING",(0,0),(-1,-1),14),
        ("TOPPADDING",(0,0),(-1,-1),10),
        ("BOTTOMPADDING",(0,0),(-1,-1),10),
    ]))
    e.append(intro)
    e.append(PageBreak())
    return e

def build_toc():
    e = []
    e.append(Paragraph("Table des Matières", h1))
    e.append(hr())
    e.append(Spacer(1, 0.3*cm))
    items = [
        ("PARTIE 1","APPLICATION WEB",""),
        ("1.","Connexion et Authentification",""),
        ("2.","Tableau de Bord",""),
        ("3.","Gestion de l'Inventaire",""),
        ("4.","Articles et Produits",""),
        ("5.","Mouvements de Stock",""),
        ("6.","Achats (Bons de commande)",""),
        ("7.","Ventes (Devis & Livraisons)",""),
        ("8.","Profil et Paramètres",""),
        ("PARTIE 2","APPLICATION MOBILE",""),
        ("9.","Installation et Connexion",""),
        ("10.","Tableau de Bord Mobile",""),
        ("11.","Inventaire Mobile",""),
        ("12.","Créer un Mouvement (Mobile)",""),
        ("13.","Profil Mobile",""),
    ]
    for num, title, _ in items:
        is_part = num.startswith("PARTIE")
        bg = INDIGO_BG if is_part else WHITE
        row = Table(
            [[Paragraph(f"<b>{num}</b>" if is_part else num, toc_n if not is_part else
              S("tn2", fontSize=11, fontName="Helvetica-Bold", textColor=PRIMARY)),
              Paragraph(f"<b>{title}</b>" if is_part else title,
              S("tt2", fontSize=11, fontName="Helvetica-Bold", textColor=DARK) if is_part else toc_t)]],
            colWidths=[1.2*cm, 15.8*cm])
        row.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1), bg),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
            ("TOPPADDING",(0,0),(-1,-1), 5),
            ("BOTTOMPADDING",(0,0),(-1,-1), 5),
            ("LINEBELOW",(0,0),(-1,-1), 0.4, colors.HexColor("#E5E7EB")),
        ]))
        e.append(row)
    e.append(PageBreak())
    return e

# ── PARTIE 1 : WEB ────────────────────────────────────────────────────────────

def part1_header():
    t = Table([[Paragraph("PARTIE 1 — APPLICATION WEB", S("ph", fontSize=14,
        fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER))]],
        colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1), PRIMARY),
        ("TOPPADDING",(0,0),(-1,-1),14),
        ("BOTTOMPADDING",(0,0),(-1,-1),14),
    ]))
    return [Spacer(1,0.2*cm), t, Spacer(1,0.3*cm)]

def ch1_login():
    e = []
    e += sec_hdr("1.", "Connexion et Authentification", PRIMARY)
    e.append(Paragraph(
        "La page de connexion est le point d'entrée unique de l'application web. "
        "Elle est accessible à l'adresse principale de la plateforme.", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(LoginMockup(), "Écran — Page de connexion StockFlow"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Comment se connecter :", h3))
    e.append(steps_table([
        "Ouvrez votre navigateur et accédez à l'URL de la plateforme StockFlow.",
        "Saisissez votre <b>adresse email</b> dans le premier champ.",
        "Saisissez votre <b>mot de passe</b> dans le second champ.",
        "Cliquez sur le bouton <b>« Se connecter »</b>.",
        "En cas de succès, vous êtes automatiquement redirigé vers le tableau de bord.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("En cas d'oubli de mot de passe, cliquez sur « Mot de passe oublié ? » sous le formulaire. Un email de réinitialisation vous sera envoyé.", "tip"))
    e.append(tip_box("Votre session est maintenue pendant plusieurs heures. Vous n'avez pas besoin de vous reconnecter à chaque visite.", "note"))
    e.append(PageBreak())
    return e

def ch2_dashboard():
    e = []
    e += sec_hdr("2.", "Tableau de Bord", PRIMARY)
    e.append(Paragraph(
        "Le tableau de bord offre une vue d'ensemble des indicateurs clés de performance "
        "et permet un accès rapide aux modules principaux.", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(DashboardMockup(), "Écran — Tableau de bord principal"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Éléments du tableau de bord :", h3))
    e += bullets([
        "<b>KPI supérieurs :</b> Total articles, Stock faible, Mouvements du jour, Entrepôts actifs",
        "<b>Actions rapides :</b> Créer un mouvement, accéder aux articles, voir l'inventaire",
        "<b>Mouvements récents :</b> Liste des 5 derniers mouvements avec statut",
        "<b>Bouton « Voir tout » :</b> Accès direct à la liste complète des mouvements",
    ])
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Cliquez sur « Rafraîchir » (glissez vers le bas ou F5) pour mettre à jour les données en temps réel.", "tip"))
    e.append(PageBreak())
    return e

def ch3_inventory():
    e = []
    e += sec_hdr("3.", "Gestion de l'Inventaire", PRIMARY)
    e.append(Paragraph(
        "Le module inventaire affiche l'état du stock pour tous les articles, "
        "regroupés par statut et accompagnés d'indicateurs visuels.", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(InventoryMockup(), "Écran — Inventaire avec graphique de répartition"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Utilisation de l'inventaire :", h3))
    e.append(steps_table([
        "Accédez à <b>Inventaire</b> depuis la barre de navigation latérale.",
        "Consultez la <b>barre de statistiques</b> en haut : total, répartition en %, barre de progression verte.",
        "Utilisez la <b>barre de recherche</b> pour filtrer par nom d'article ou référence SKU.",
        "Cliquez sur un <b>filtre de statut</b> (Tous / Stock faible / Rupture) pour affiner la vue.",
        "Les articles sont <b>groupés par statut</b> (En stock, Stock faible, Rupture). Cliquez sur l'en-tête pour réduire/étendre un groupe.",
        "La <b>barre de progression</b> sous chaque article indique le niveau de stock en pourcentage.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Les articles en rouge (Rupture) ou orange (Stock faible) nécessitent une action immédiate : créer un mouvement de réception ou une commande fournisseur.", "warn"))
    e.append(PageBreak())
    return e

def ch4_items():
    e = []
    e += sec_hdr("4.", "Articles et Produits", PRIMARY)
    e.append(Paragraph(
        "Le catalogue d'articles regroupe tous les produits gérés par la plateforme. "
        "Chaque article possède un SKU unique, une catégorie, un prix et un niveau de stock associé.", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(ItemsMockup(), "Écran — Liste des articles avec filtres"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Créer un nouvel article :", h3))
    e.append(steps_table([
        "Cliquez sur le bouton <b>« + Article »</b> en haut à droite de la page.",
        "Renseignez le <b>nom</b>, la <b>catégorie</b>, le <b>SKU</b> (ou laissez-le générer automatiquement).",
        "Indiquez le <b>prix d'achat</b>, le <b>prix de vente</b> et l'<b>unité de mesure</b>.",
        "Définissez les <b>seuils de stock</b> : quantité minimale et maximale.",
        "Ajoutez une <b>description</b> et une <b>image</b> si nécessaire.",
        "Cliquez sur <b>« Enregistrer »</b> pour valider la création.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Vous pouvez importer plusieurs articles en une seule opération via un fichier CSV. Utilisez le bouton « Import CSV » et suivez le modèle fourni.", "tip"))
    e.append(PageBreak())
    return e

def ch5_movements():
    e = []
    e += sec_hdr("5.", "Mouvements de Stock", PRIMARY)
    e.append(Paragraph(
        "Les mouvements tracent toutes les entrées, sorties et transferts d'articles. "
        "Chaque mouvement génère automatiquement un code de référence unique (ex. MOV-A1B2C3D4).", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(MovementsMockup(), "Écran — Liste des mouvements de stock"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Créer un nouveau mouvement :", h3))
    e.append(mockup_with_caption(CreateMovementMockup(), "Écran — Formulaire de création de mouvement"))
    e.append(Spacer(1,0.2*cm))
    e.append(steps_table([
        "Cliquez sur <b>« + Nouveau »</b> ou <b>« + Mouvement »</b> depuis le tableau de bord.",
        "Sélectionnez le <b>type de mouvement</b> dans la grille (RECEIPT, ISSUE, TRANSFER, etc.).",
        "Choisissez l'<b>entrepôt</b> concerné via le menu déroulant de recherche.",
        "Sélectionnez l'<b>emplacement source</b> et/ou l'<b>emplacement destination</b> selon le type.",
        "Ajoutez les <b>articles</b> : cliquez sur « Sélectionner un article », tapez pour filtrer, puis définissez la quantité.",
        "Ajoutez autant de lignes d'articles que nécessaire avec le bouton <b>« + Ajouter »</b>.",
        "Renseignez optionnellement un <b>numéro de référence</b>, une <b>priorité</b> et des <b>notes</b>.",
        "Cliquez sur <b>« Créer le Mouvement »</b> pour valider.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Les types de mouvement : RECEIPT (entrée), ISSUE (sortie), TRANSFER (transfert entre emplacements), ADJUSTMENT (correction), PICKING, PUTAWAY, RETURN, RELOCATION.", "note"))
    e.append(PageBreak())
    return e

def ch6_purchases():
    e = []
    e += sec_hdr("6.", "Achats — Bons de Commande", PRIMARY)
    e.append(Paragraph(
        "Le module Achats permet de gérer les commandes passées auprès des fournisseurs. "
        "À la réception, le stock est automatiquement mis à jour.", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(PurchasesMockup(), "Écran — Gestion des bons de commande fournisseurs"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Créer un bon de commande :", h3))
    e.append(steps_table([
        "Accédez à <b>Achats</b> dans le menu latéral.",
        "Cliquez sur <b>« + Bon de commande »</b>.",
        "Sélectionnez le <b>fournisseur</b> dans la liste déroulante.",
        "Ajoutez les <b>articles</b> commandés avec les quantités et prix unitaires.",
        "Définissez la <b>date de livraison attendue</b>.",
        "Enregistrez en statut <b>DRAFT</b> ou envoyez directement au fournisseur (statut <b>SENT</b>).",
        "À réception des marchandises, cliquez sur <b>« Confirmer la réception »</b> pour mettre à jour le stock.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Les statuts d'un bon de commande : DRAFT → SENT → CONFIRMED → RECEIVED. Chaque étape peut être annulée (CANCELLED) si nécessaire.", "note"))
    e.append(PageBreak())
    return e

def ch7_sales():
    e = []
    e += sec_hdr("7.", "Ventes — Devis &amp; Livraisons", PRIMARY)
    e.append(Paragraph(
        "Le module Ventes couvre la création de devis clients et leur transformation en "
        "bons de livraison. La validation d'une livraison décrémente automatiquement le stock.", body))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Créer un devis client :", h3))
    e.append(steps_table([
        "Accédez à <b>Ventes</b> dans le menu latéral.",
        "Cliquez sur <b>« + Devis »</b>.",
        "Sélectionnez le <b>client</b> dans la liste ou créez-en un nouveau.",
        "Ajoutez les <b>articles</b> avec quantités et prix de vente.",
        "Définissez la <b>date de validité</b> du devis.",
        "Enregistrez en statut <b>DRAFT</b> ou confirmez immédiatement (statut <b>CONFIRMED</b>).",
        "Pour expédier, cliquez sur <b>« Générer bon de livraison »</b> puis confirmez la livraison.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Une fois le bon de livraison confirmé (DELIVERED), le stock est automatiquement déduit. Cette action est irréversible.", "warn"))
    e.append(PageBreak())
    return e

def ch8_profile():
    e = []
    e += sec_hdr("8.", "Profil et Paramètres", PRIMARY)
    e.append(Paragraph(
        "La page Profil permet de gérer les informations personnelles, la sécurité du compte "
        "et les préférences d'affichage.", body))
    e.append(Spacer(1,0.2*cm))
    e.append(mockup_with_caption(ProfileMockup(), "Écran — Page profil et paramètres"))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Actions disponibles :", h3))
    e += bullets([
        "<b>Informations du compte :</b> modifier le prénom, nom, email et photo de profil",
        "<b>Sécurité :</b> changer le mot de passe (ancien + nouveau mot de passe requis)",
        "<b>Notifications :</b> activer/désactiver les alertes email et push",
        "<b>Apparence :</b> basculer entre le thème sombre et le thème clair",
        "<b>À propos :</b> informations sur la version de l'application",
        "<b>Déconnexion :</b> terminer la session en toute sécurité",
    ])
    e.append(PageBreak())
    return e

# ── PARTIE 2 : MOBILE ─────────────────────────────────────────────────────────

def part2_header():
    t = Table([[Paragraph("PARTIE 2 — APPLICATION MOBILE", S("ph2", fontSize=14,
        fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER))]],
        colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1), TEAL),
        ("TOPPADDING",(0,0),(-1,-1),14),
        ("BOTTOMPADDING",(0,0),(-1,-1),14),
    ]))
    return [Spacer(1,0.2*cm), t, Spacer(1,0.3*cm)]

def ch9_mobile_install():
    e = []
    e += sec_hdr("9.", "Installation et Connexion Mobile", TEAL)
    e.append(Paragraph(
        "L'application StockFlow Mobile est disponible pour Android (APK) et iOS. "
        "Elle offre un accès complet aux fonctionnalités depuis n'importe où.", body))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Installation Android :", h3))
    e.append(steps_table([
        "Téléchargez le fichier <b>StockFlow.apk</b> sur votre appareil Android.",
        "Activez <b>« Sources inconnues »</b> dans Paramètres → Sécurité (si demandé).",
        "Ouvrez le fichier APK et appuyez sur <b>« Installer »</b>.",
        "Lancez l'application depuis votre écran d'accueil.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(Paragraph("Connexion :", h3))
    e.append(steps_table([
        "Entrez l'<b>URL du serveur</b> StockFlow dans les paramètres (si non configurée).",
        "Saisissez votre <b>email</b> et <b>mot de passe</b>.",
        "Appuyez sur <b>« Se connecter »</b>.",
        "La session est maintenue automatiquement grâce au refresh token sécurisé.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("L'application fonctionne uniquement si votre appareil est connecté au même réseau que le serveur StockFlow (Wi-Fi d'entreprise ou VPN).", "warn"))
    e.append(PageBreak())
    return e

def ch10_mobile_dash():
    e = []
    e += sec_hdr("10.", "Tableau de Bord Mobile", TEAL)
    e.append(Paragraph(
        "L'écran d'accueil mobile présente les KPI essentiels et les derniers mouvements. "
        "Navigation par onglets en bas de l'écran.", body))
    e.append(Spacer(1,0.3*cm))
    e.append(three_phones(
        MobileDashboard(),
        MobileInventory(),
        MobileProfile(),
        ["Tableau de bord", "Inventaire", "Profil"],
    ))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Navigation par onglets :", h3))
    e += bullets([
        "<b>Accueil (⊞) :</b> Tableau de bord avec KPI et mouvements récents",
        "<b>Inventaire (📦) :</b> Stock groupé par statut avec barres de progression",
        "<b>Mvts (↔) :</b> Liste et création de mouvements de stock",
        "<b>Achats (🛒) :</b> Bons de commande fournisseurs",
        "<b>Profil (👤) :</b> Paramètres, thème, déconnexion",
    ])
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Glissez vers le bas sur n'importe quelle liste pour rafraîchir les données (pull-to-refresh).", "tip"))
    e.append(PageBreak())
    return e

def ch11_mobile_inventory():
    e = []
    e += sec_hdr("11.", "Inventaire Mobile", TEAL)
    e.append(Paragraph(
        "L'inventaire mobile affiche le stock groupé par statut avec un graphique de répartition "
        "et une barre de progression par article.", body))
    e.append(Spacer(1,0.3*cm))
    e += bullets([
        "<b>Graphique de répartition :</b> barre segmentée verte/orange/rouge + pourcentages",
        "<b>Groupes :</b> En stock ✔, Stock faible ⚠, Rupture ✘ — appuyez pour réduire/étendre",
        "<b>Barre de progression :</b> chaque article affiche son niveau de stock visuellement",
        "<b>Recherche :</b> filtrez par nom ou SKU en temps réel",
    ])
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("La barre de progression verte indique que le stock est sain. Orange = proche du seuil minimum. Rouge = rupture ou stock nul.", "note"))
    e.append(PageBreak())
    return e

def ch12_mobile_movement():
    e = []
    e += sec_hdr("12.", "Créer un Mouvement (Mobile)", TEAL)
    e.append(Paragraph(
        "La création de mouvements sur mobile dispose de dropdowns de recherche pour "
        "tous les champs : entrepôt, emplacements, articles.", body))
    e.append(Spacer(1,0.3*cm))
    e.append(Paragraph("Créer un mouvement depuis le mobile :", h3))
    e.append(steps_table([
        "Appuyez sur l'onglet <b>Mvts (↔)</b> puis sur le bouton <b>« + »</b>.",
        "Sélectionnez le <b>type de mouvement</b> dans la grille (ex. TRANSFER).",
        "Appuyez sur <b>Entrepôt</b> → un panneau de recherche s'ouvre → tapez pour filtrer → sélectionnez.",
        "Appuyez sur <b>Emplacement source</b> → même processus de recherche.",
        "Appuyez sur <b>Emplacement destination</b> si le type le requiert.",
        "Dans la section Articles, appuyez sur <b>« Sélectionner un article »</b> → recherchez et choisissez.",
        "Saisissez la <b>quantité</b> dans le champ numérique.",
        "Appuyez sur <b>« + Ajouter »</b> pour ajouter d'autres lignes d'articles.",
        "Appuyez sur <b>« Créer le Mouvement »</b> pour valider.",
    ]))
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("Chaque dropdown de recherche s'ouvre en panneau bas (bottom sheet). Tapez les premiers caractères pour filtrer instantanément la liste.", "tip"))
    e.append(PageBreak())
    return e

def ch13_mobile_profile():
    e = []
    e += sec_hdr("13.", "Profil Mobile", TEAL)
    e.append(Paragraph(
        "L'écran Profil mobile permet de gérer les informations du compte, "
        "le thème de l'application et la déconnexion.", body))
    e.append(Spacer(1,0.3*cm))
    e += bullets([
        "<b>Carte utilisateur :</b> affiche le nom, email, rôle et statut du compte",
        "<b>Profil :</b> modifier les informations personnelles et la photo",
        "<b>Mot de passe :</b> changer le mot de passe de connexion",
        "<b>Notifications :</b> paramétrer les alertes push et email",
        "<b>Mode sombre :</b> basculer entre thème sombre et clair (enregistré automatiquement)",
        "<b>À propos :</b> version de l'application et description du projet",
        "<b>Se déconnecter :</b> terminer la session et revenir à l'écran de connexion",
    ])
    e.append(Spacer(1,0.2*cm))
    e.append(tip_box("La photo de profil définie sur l'application web est automatiquement synchronisée et affichée sur l'application mobile.", "note"))
    # Final page
    e.append(Spacer(1, 0.5*cm))
    e.append(hr(GRAY_M, 0.8))
    e.append(Spacer(1, 0.3*cm))
    end = Table([[Paragraph(
        "Pour toute assistance, contactez votre administrateur système.<br/>"
        "Guide StockFlow v1.0 — Juin 2025 — Tous droits réservés.",
        S("end", fontSize=9, fontName="Helvetica", textColor=GRAY_M, alignment=TA_CENTER)
    )]], colWidths=[17*cm])
    e.append(end)
    return e

# ── Build ─────────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=1.2*cm, bottomMargin=1.2*cm,
    title="Guide d'Utilisation StockFlow",
    author="Équipe StockFlow")

all_e = (
    build_cover() + build_toc() +
    part1_header() +
    ch1_login() + ch2_dashboard() + ch3_inventory() +
    ch4_items() + ch5_movements() + ch6_purchases() +
    ch7_sales() + ch8_profile() +
    part2_header() +
    ch9_mobile_install() + ch10_mobile_dash() +
    ch11_mobile_inventory() + ch12_mobile_movement() + ch13_mobile_profile()
)

doc.build(all_e, onFirstPage=on_page, onLaterPages=on_page)
print("PDF OK: " + OUTPUT)
