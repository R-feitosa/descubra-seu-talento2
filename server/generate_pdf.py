#!/usr/bin/env python3.11
import sys
import json
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def wrap_text(text, max_chars=80):
    """Quebra texto em linhas"""
    words = text.split()
    lines = []
    current_line = ""
    
    for word in words:
        if len(current_line + word) < max_chars:
            current_line += word + " "
        else:
            if current_line:
                lines.append(current_line.strip())
            current_line = word + " "
    
    if current_line:
        lines.append(current_line.strip())
    
    return lines

def generate_pdf(data, output_path):
    """Gera o PDF do relatório"""
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Página 1: Capa com timbre
    try:
        capa_img = ImageReader("/home/ubuntu/rfeitosa-talento-game/client/public/pdf-assets/capa-timbre.png")
        c.drawImage(capa_img, 0, 0, width=width, height=height, preserveAspectRatio=True, mask='auto')
    except Exception as e:
        print(f"Erro ao carregar capa: {e}", file=sys.stderr)
    
    # Nome do candidato na capa
    c.setFont("Helvetica", 20)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawString(60, 120, data['trainee']['name'])
    
    c.showPage()
    
    # Carregar timbre das páginas internas
    try:
        pagina_img = ImageReader("/home/ubuntu/rfeitosa-talento-game/client/public/pdf-assets/pagina-timbre.png")
    except Exception as e:
        print(f"Erro ao carregar timbre: {e}", file=sys.stderr)
        pagina_img = None
    
    # Página 2: Talentos
    if pagina_img:
        c.drawImage(pagina_img, 0, 0, width=width, height=height, preserveAspectRatio=True, mask='auto')
    
    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(0.616, 0.043, 0.137)  # #9D2723
    c.drawString(60, height - 150, "Seus Talentos Profissionais")
    
    y = height - 200
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    
    for genius in data['geniuses']:
        c.setFont("Helvetica-Bold", 16)
        c.drawString(60, y, genius['name'])
        y -= 25
        
        c.setFont("Helvetica", 11)
        lines = wrap_text(genius['description'], 80)
        for line in lines:
            c.drawString(60, y, line)
            y -= 15
        y -= 15
    
    c.showPage()
    
    # Página 3: Pontos de Melhoria e Tendência
    if pagina_img:
        c.drawImage(pagina_img, 0, 0, width=width, height=height, preserveAspectRatio=True, mask='auto')
    
    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(0.616, 0.043, 0.137)
    c.drawString(60, height - 150, "Pontos de Melhoria")
    
    y = height - 200
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    
    for weakness in data['weaknesses']:
        c.setFont("Helvetica-Bold", 14)
        c.drawString(60, y, weakness['name'])
        y -= 20
        c.setFont("Helvetica", 11)
        c.drawString(60, y, weakness['description'])
        y -= 30
    
    y -= 20
    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(0.616, 0.043, 0.137)
    c.drawString(60, y, "Tendência Dominante")
    y -= 30
    c.setFont("Helvetica", 14)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawString(60, y, data['tendency'])
    
    c.showPage()
    
    # Página 4: Conselho de Carreira
    if pagina_img:
        c.drawImage(pagina_img, 0, 0, width=width, height=height, preserveAspectRatio=True, mask='auto')
    
    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(0.616, 0.043, 0.137)
    c.drawString(60, height - 150, "Conselho de Carreira")
    
    y = height - 200
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    
    lines = wrap_text(data['careerAdvice'], 80)
    for line in lines:
        c.drawString(60, y, line)
        y -= 15
    
    c.save()
    print(output_path)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python3.11 generate_pdf.py <json_data> <output_path>", file=sys.stderr)
        sys.exit(1)
    
    data = json.loads(sys.argv[1])
    output_path = sys.argv[2]
    
    generate_pdf(data, output_path)

