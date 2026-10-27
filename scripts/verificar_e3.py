"""Verifica /e3/ (dist-e3/index.html), abierto por file://, sin servidor.

    npm run build:e3 && python3 scripts/verificar_e3.py [--capturas DIR] [--sin-capturas] [--sin-esqueletos]
                                                        [--hoja RUTA [--hoja-vistas v01,…]]

(27/10, W1) Rehecho para el armazón del E2 (riel, encabezado con la pregunta, banda de cifras, zoom
uniforme de e3/src/zoom.js). La paridad con /e2/ la mide scripts/paridad_e3.py; esto cubre lo demás:

1. Cada vista del riel (V01 a V07 y A1 a A7) a 1152×640, 1280×720, 1366×768, 1536×864 y 1920×1080:
   - monta, la página no scrollea y window.__fit() (src/fit.js) no encuentra desbordes;
   - el zoom es el declarado: k = máx(1; mín(1,2; ancho / 1152; alto / 640));
   - las vistas con contenido no muestran controles sin abrir «Explorar» (W1: solo la 5). Las vistas
     esqueleto solo se montan: su contenido se verifica cuando W2 y W3 las construyan. Con
     --sin-esqueletos, una vista que todavía muestre .e3-esqueleto es un problema (obligatorio antes de
     exportar: el esqueleto dice «se arma en la etapa siguiente» y la tecla I lo imprime);
   - cada rótulo de la banda de cifras entra en una línea, como en el E2 (un rótulo partido baja la
     cifra de su tarjeta y la desalinea de las otras).
2. Cero errores de consola y cero pedidos de red (solo el propio archivo).
3. Recorrido de quien presenta (a 1536×864): → y ← de punta a punta, Av Pág y Re Pág, Inicio y Fin, una
   tecla mantenida no recorre, la URL sigue a la vista (recargar y Atrás), N abre las notas con el guion
   de C3 sin tapar el tablero, «.» y B ponen la pantalla en negro y cualquier tecla vuelve sin cambiar de
   vista, F5 no recarga, el riel lleva a cada vista, dos ventanas se siguen y la ventana de notas
   (?notas) sigue a la del tablero. A 1366×768 y 1536×864, el guion de cada vista entra en el panel de
   notas sin desplazar.
4. Capturas de cada vista con contenido a 1280×720 y 1920×1080 en e3/capturas-verif/ (fuera del
   control de versiones).
5. (27/10, W2 y W3) Contenido de las vistas 1 a 7, en cada resolución, contra lo que dicen D3 y C3 (leídos de
   e3/src/datos_e3.js y contenido_e3.js y escritos con las mismas reglas de e3/src/formato.js):
   - la tarjeta de decisión dice el «id · estado» de su decisión en e3/src/decisiones.js;
   - las cifras de la banda, en orden, son las de su fila del registro, y hay una sola al tamaño máximo,
     en la tarjeta central (regla 13 H1 del E2);
   - el gráfico escribe sus valores clave (la tasa de éxito, los días del cliente, los puntajes, la
     precisión de cada método, el beneficio de la regla);
   - en pantalla, ni «pendiente», «abierto», «a definir», «sin respuesta» ni «espera respuesta» (tampoco
     en los title), ni códigos internos («envío 29», «G40»: regla 13 H13 del E2);
   - ningún texto de un gráfico pisa a otro;
   - «Explorar» llega cerrado; abierto, en cada opción, __fit sigue limpio y ningún texto se pisa;
     «Cerrar» vuelve a un gráfico;
   - (a 1366×768 y 1536×864, con N) las notas traen el guion de cada diapositiva de la vista, con quién
     lo dice.

6. (W2) Con --hoja, una hoja de contacto de las vistas con contenido (por defecto, de la 1 a la 7) a
   1536 × 864, dos por fila, para mirarla de una vez.
7. (27/10, W3) Datos de la Parte D, sin navegador: D3 trae las filas J01 a J22, J50 a J52 y las cinco cifras de las
   vistas 2 y 6 que antes solo tenía C3 (C14, C08, H40, C18, J22); cada valor, escrito con formato.js, da lo que
   dice el registro, y los del test coinciden con data/e3/etapa4.json. En pantalla, la vista 7 (si ya no es
   esqueleto) escribe la precisión del test del modelo y de la regla (J03).

Termina con «E3 OK» o con la lista de problemas y código 1.
"""
from __future__ import annotations

import argparse
import glob
import json
import re
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
HTML = APP / "dist-e3" / "index.html"
RES = [(1152, 640), (1280, 720), (1366, 768), (1536, 864), (1920, 1080)]
CAPTURAR = {(1280, 720), (1920, 1080)}
NOTAS_RES = {(1366, 768), (1536, 864)}   # laptops donde se ensaya con el panel de notas
HISTORIA = [f"v{i:02d}" for i in range(1, 8)]   # W3: las vistas 7 a 9 del plan van en una, la V07
RESPALDO = [f"a{i}" for i in range(1, 8)]
VISTAS = HISTORIA + RESPALDO
SRC = APP / "e3" / "src"


def k_de(w, h):
    return max(1.0, min(1.2, w / 1152, h / 640))


CHEQUEO = r"""() => {
  const p = []
  if (!document.querySelector('.cuerpo .pant')) return { problemas: ['sin vista montada'], esqueleto: false }
  const se = document.scrollingElement
  if (se.scrollHeight > se.clientHeight + 1 || se.scrollWidth > se.clientWidth + 1) p.push('la página scrollea')
  const fit = window.__fit()
  for (const x of fit.problemas) p.push(`__fit: ${x.tipo} ${x.detalle ?? ''}`)
  const esqueleto = !!document.querySelector('.cuerpo .e3-esqueleto')
  for (const s of document.querySelectorAll('.cuerpo .e2-banda .kpi-lbl > span')) {
    const lh = parseFloat(getComputedStyle(s).lineHeight) || parseFloat(getComputedStyle(s).fontSize) * 1.2
    if (s.getClientRects().length > 1 || s.getBoundingClientRect().height > lh * 1.5)
      p.push(`rótulo de la banda en dos renglones: «${s.textContent}»`)
  }
  if (!esqueleto && document.querySelector('.cuerpo [role=slider], .cuerpo .e3-opciones'))
    p.push('controles a la vista sin abrir «Explorar»')
  return { problemas: p, esqueleto, zoom: document.querySelector('.e3-vp')?.currentCSSZoom ?? 1 }
}"""

ESTADO = r"""() => ({
  hash: location.hash,
  negro: !!document.querySelector('.e3-negro'),
  notas: !!document.querySelector('.e3-notas'),
  activa: document.querySelector('.lat-item.on .lat-n')?.textContent.trim() ?? '',
})"""


# ---------------------------------------------------------------- 5. contenido de las vistas (W2)

NBSP = " "
MENOS = "−"


def leer_js(nombre, var):
    """El objeto de «export const VAR = {…};» de un archivo generado (es JSON)."""
    t = (SRC / nombre).read_text()
    i = t.index(f"export const {var} = ") + len(f"export const {var} = ")
    return json.loads(t[i:].strip().rstrip(";"))


def fijo(x, d=0, signo=False):
    """formato.js: toFixed de JS (mitad lejos del cero sobre el valor binario exacto), punto de miles,
    coma decimal y menos U+2212."""
    q = Decimal(abs(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)
    ent, _, fr = f"{q:.{d}f}".partition(".")
    cuerpo = f"{int(ent):,}".replace(",", ".") + ("," + fr if fr else "")
    if not q:
        return cuerpo
    if x < 0:
        return MENOS + cuerpo
    return "+" + cuerpo if signo else cuerpo


def pct(frac, d=1):
    return fijo(frac * 100, d) + NBSP + "%"


def pct_directo(x, d=2):
    return fijo(x, d) + NBSP + "%"


def usd(x, d=0):
    return "USD" + NBSP + fijo(x, d)


def plano(t):
    return re.sub(r"\[\[|\]\]", "", (t or "").replace("**", ""))


def norm(t):
    return re.sub(r"\s+", " ", (t or "").replace(NBSP, " ")).strip()


def contenido_esperado():
    """Lo que tiene que decir cada vista, calculado desde D3 y C3 (no desde el JSX)."""
    D3 = leer_js("datos_e3.js", "D3")
    C3 = leer_js("contenido_e3.js", "C3")
    dia = {d["n"]: d for d in C3["DIAPOSITIVAS"]}
    # decisiones.js: las de la diapositiva 2 (estado: escala si el valor es cifra) y las propias
    estados = {}
    for t in dia[2]["tarjetas"]:
        m = next((d for d in C3["DIAPOSITIVAS"]
                  if re.fullmatch(rf"Parte ([A-D]) · Factibilidad {t['area'].lower()}", d.get("kicker", ""))), None)
        if m:
            letra = m["kicker"].split()[1]
            area = t["area"].translate(str.maketrans("ÁÉÍÓÚáéíóú", "AEIOUaeiou"))
            estados[f"{letra}-{area[:3].upper()}"] = (t["escala"] if t["valor"][:1].isdigit() else t["valor"]).lower()
    for id_, est in re.findall(r"\{ id: '([A-Z]-[A-Z]{3})', area: '[^']*', estado: '([^']*)' \}",
                               (SRC / "decisiones.js").read_text()):
        estados[id_] = est
    T, E, C, MD = D3["tecnica"], D3["economia"], D3["caso"], D3["modelos"]
    TE, P, PL = D3["test"], D3["piloto"], D3["plan"]   # W3: la etapa 4, el piloto y el plan (Parte D)
    tope = fijo(T["escala"][-1]["hasta"], 0)
    leg = next(t for t in dia[2]["tarjetas"] if t["area"] == "Legal")

    a4 = next(a for a in C3["ANEXOS"] if a["n"] == "A4")
    regla = E["observada"]["regla_usd"]
    tramo_t = next(e for e in T["escala"] if e["nivel"] == T["nivel"])
    m = re.search(r"(\d+(?:,\d+)?) a (\d+(?:,\d+)?) es ([^.]+)", dia[10]["escala"])
    esperado = {
        "v01": ("D-PRO", [f"{fijo(T['promedio'], 2)}/{tope}", pct_directo(E["observada"]["modelo_roi_pct"], 2),
                          plano(leg["valor"])],
                [pct(E["parametros"]["s_observada"], 2)]),
        "v02": ("A-UMB", [plano(c["valor"]) for c in dia[3]["cifras"]],
                [f"{fijo(C['recency_dias'])} días sin comprar", f"umbral {fijo(C['umbral_dias'])} días",
                 f"faltaban {fijo(C['dias_para_cruzar'])}"]),
        "v03": ("A-TEC", [f"{fijo(T['promedio'], 2)}/{tope}", fijo(T["positivos_entrenamiento"]),
                          pct_directo(T["ventas_sin_cliente_pct"], 1)],
                [f"promedio {fijo(T['promedio'], 2)}",
                 f"{tramo_t['nivel'].lower()} · {fijo(tramo_t['desde'], 1)} a {fijo(tramo_t['hasta'], 1)}"]),
        # W3: la vista 4 decide con el test (Parte D 8.2 y 11.1): sin filtrar, en la lista que sale y lo que tendría
        # que dar para pagarse; el gráfico, la diferencia con su intervalo en validación y en test.
        "v04": ("C-MOD", [fijo(TE["sin_filtro"]["diferencia_pp"], 2, True),
                          fijo(TE["contra_regla"]["diferencia_pp"], 2, True),
                          fijo(TE["decision"]["aciertos_por_mes_para_pagar"])],
                [fijo(x, 2, True) for x in (MD["contra_regla"]["diferencia_pp"], TE["sin_filtro"]["diferencia_pp"],
                                            TE["contra_regla"]["validacion_diferencia_pp"],
                                            TE["contra_regla"]["diferencia_pp"])]),
        "v05": ("B-ECO", [usd(E["observada"]["modelo_usd"], 2), pct_directo(E["observada"]["modelo_roi_pct"], 2),
                          pct(E["umbral"]["s_equilibrio_con_descuento"], 1)],
                [usd(regla, 2 if regla < 1000 else 0)]),
        "v06": ("C-LEG", [plano(dia[10]["promedio"]["valor"]), plano(dia[10]["alerta"]["valor"]),
                          f"{len(a4['destacar'])} de {len(a4['filas'])}"],
                [f"{m.group(3)} · {m.group(1)} a {m.group(2)}"] if m else []),
        # W3: la Parte D y el piloto. La regla en test (J03), lo que el piloto tiene que dar para ir a producción
        # (H49) y las semanas hasta decidir (J50); el gráfico, la regla de decisión del piloto (G49, H49).
        "v07": ("D-PRO", [pct(TE["metodos"]["regla"]["test"]["precision"], 1), fijo(P["umbral_produccion_pp"], 1),
                          f"{fijo(PL['semanas'])} semanas"],
                [fijo(P["diferencia_detectable_pp"], 2), fijo(P["umbral_produccion_pp"], 1)]),
    }
    out = {}
    for v, (id_, cifras, grafico) in esperado.items():
        out[v] = {"dec": f"{id_} · {estados.get(id_, '¿?')}", "cifras": [norm(x) for x in cifras],
                  "grafico": [norm(x) for x in grafico]}
    # el guion de cada vista: quién y el comienzo de lo que dice, por diapositiva (vistas/index.jsx)
    de = dict(re.findall(r"\{ id: '(V\d\d)'.*?de: \[([\d, ]*)\]", (SRC / "vistas" / "index.jsx").read_text()))
    guion = {}
    for v, ns in de.items():
        ds = [dia[int(n)] for n in re.findall(r"\d+", ns)]
        guion[v.lower()] = [(d["quien"], norm(plano(d["guion"]))[:40]) for d in ds]
    return out, guion


LEER_VISTA = r"""() => {
  const q = (s) => document.querySelector(s)
  const banda = [...document.querySelectorAll('.e2-banda-cifras .par-val')].map((e) => e.textContent)
  const grandes = [...document.querySelectorAll('.e2-banda-cifras .e2-cifra:not(.sec)')]
  const svgs = [...document.querySelectorAll('.cuerpo .lienzo svg')].filter((s) => !s.parentElement.closest('svg'))
  const textosSvg = svgs.flatMap((s) => [...s.querySelectorAll('text')].map((t) => t.textContent))
  // textos de un gráfico que se pisan: cajas en pantalla, con 1 px de tolerancia por lado
  const pisan = []
  for (const s of svgs) {
    const ts = [...s.querySelectorAll('text')].filter((t) => t.textContent.trim())
      .map((t) => ({ t: t.textContent.trim(), r: t.getBoundingClientRect() }))
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i].r, b = ts[j].r
      const x = Math.min(a.right, b.right) - Math.max(a.left, b.left) - 2
      const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) - 2
      if (x > 0 && y > 0) pisan.push(`«${ts[i].t}» y «${ts[j].t}»`)
    }
  }
  const vp = q('.e3-vp')
  const titulos = [...vp.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
    .concat([...vp.querySelectorAll('svg title')].map((e) => e.textContent))
  const exp = q('.cuerpo .e3-explorar')
  return {
    dec: q('.tarjeta-dec .kpi-lbl > b')?.textContent ?? null,
    banda, grandes: grandes.length, grandeCentral: grandes.length === 1 && !!grandes[0].closest('.e2-central'),
    graficos: svgs.length, textosSvg, pisan,
    pantalla: vp.innerText + '\n' + textosSvg.join('\n'), cuerpo: q('.cuerpo').innerText + '\n' + textosSvg.join('\n'),
    titulos,
    explorar: exp ? exp.getAttribute('aria-expanded') : null,
    opciones: [...document.querySelectorAll('.cuerpo .e3-opciones [role=radio]')].length,
    fit: window.__fit().problemas.map((x) => `${x.tipo} ${x.detalle ?? ''}`),
  }
}"""
PROHIBIDAS = re.compile(r"\b(pendientes?|abiert[oa]s?|a definir|sin respuesta|espera respuesta)\b", re.I)
CODIGOS = re.compile(r"\benv[ií]o \d+|\bconsulta \d+|\b[A-H]\d{2}\b")


def revisar_estado(p: Pagina, id_, estado, r):
    if m := PROHIBIDAS.search(r["pantalla"]):
        p.mal(f"{id_} ({estado}): en pantalla dice «{m.group(0)}»")
    for t in r["titulos"]:
        if m := PROHIBIDAS.search(t or ""):
            p.mal(f"{id_} ({estado}): un title dice «{m.group(0)}»: «{t[:80]}»")
    if m := CODIGOS.search(r["cuerpo"]):
        p.mal(f"{id_} ({estado}): código interno en pantalla «{m.group(0)}»")
    for x in r["pisan"]:
        p.mal(f"{id_} ({estado}): en el gráfico se pisan {x}")
    for x in r["fit"]:
        p.mal(f"{id_} ({estado}): __fit {x}")


def contenido(p: Pagina, esperado):
    for id_, e in esperado.items():
        p.ir(id_)
        r = p.pg.evaluate(LEER_VISTA)
        if norm(r["dec"]) != norm(e["dec"]):
            p.mal(f"{id_}: la decisión dice «{r['dec']}», se esperaba «{e['dec']}»")
        banda = [norm(x) for x in r["banda"]]
        if banda != e["cifras"]:
            p.mal(f"{id_}: la banda dice {banda}, se esperaba {e['cifras']}")
        if not r["grandeCentral"]:
            p.mal(f"{id_}: {r['grandes']} cifras al tamaño máximo; tiene que haber una, en la tarjeta central")
        if r["graficos"] != 1:
            p.mal(f"{id_}: {r['graficos']} gráficos al llegar")
        svg = norm(" | ".join(r["textosSvg"]))
        for x in e["grafico"]:
            if x not in svg:
                p.mal(f"{id_}: el gráfico no escribe «{x}»")
        revisar_estado(p, id_, "al llegar", r)
        if r["explorar"] is None:
            continue
        if r["explorar"] != "false":
            p.mal(f"{id_}: «Explorar» no llega cerrado")
        boton = p.pg.locator(".cuerpo .e3-explorar")
        boton.click()
        p.quieto(80)
        r = p.pg.evaluate(LEER_VISTA)
        if r["explorar"] != "true":
            p.mal(f"{id_}: «Explorar» no abre")
        revisar_estado(p, id_, "Explorar", r)
        for i in range(r["opciones"]):
            p.pg.locator(".cuerpo .e3-opciones [role=radio]").nth(i).click()
            p.quieto(80)
            revisar_estado(p, id_, f"Explorar, opción {i + 1}", p.pg.evaluate(LEER_VISTA))
        boton.click()
        p.quieto(80)
        r = p.pg.evaluate(LEER_VISTA)
        if r["explorar"] != "false" or r["graficos"] != 1 or r["opciones"]:
            p.mal(f"{id_}: «Cerrar» no vuelve a la vista presentada")


def guion_en_notas(p: Pagina, w, h, guion):
    """Con N abierto, las notas de cada vista traen su guion: quién lo dice y el comienzo de cada parte."""
    p.ir("v01")
    p.tecla("n")
    for id_, partes in guion.items():
        p.ir(id_)
        txt = norm(p.pg.evaluate("() => document.querySelector('.e3-notas')?.innerText ?? ''"))
        for quien, comienzo in partes:
            if quien not in txt or comienzo not in txt:
                p.mal(f"notas {w}x{h}: #{id_} no trae el guion de {quien} («{comienzo}…»)")
    p.tecla("n")


# ---------------------------------------------------------------- 6. datos de la Parte D (W3)

# Filas del registro que D3 tiene que traer desde W3: la etapa 4 (J01 a J21), la matriz de riesgos (J22), el plan
# (J50), la campaña de noviembre (J51), la alerta de drift (J52) y las cinco cifras de las vistas 2 y 6 que hasta W2
# solo estaban en el texto de C3 (C14, C08, H40, C18; J22 es la quinta).
IDS_D = [f"J{i:02d}" for i in range(1, 23)] + ["J50", "J51", "J52", "C14", "C08", "H40", "C18"]


def anclas_datos():
    """Sin navegador. D3 trae cada fila de IDS_D en D3.anclas; sus valores, escritos con formato.js, dan lo que dice
    el registro (wiki/entregables/cifras-entregable-3.md), y los del test coinciden con data/e3/etapa4.json leído
    acá, no a través de build_e3.py."""
    D3 = leer_js("datos_e3.js", "D3")
    mal = []
    faltan = [k for k in ("encuadre", "legal", "test", "plan", "monitoreo") if k not in D3]
    if faltan:
        return [f"datos: D3 no trae {', '.join(faltan)}: corre «python3 -I pipeline/build_e3.py»"]
    ids = {a["id"] for a in D3["anclas"]}
    mal += [f"datos: D3.anclas no tiene la fila {i}" for i in IDS_D if i not in ids]
    T, EN, LE, PL, MO = D3["test"], D3["encuadre"], D3["legal"], D3["plan"], D3["monitoreo"]
    L, R, PA = (T["metodos"][k]["test"] for k in ("logistica_ajustada", "regla", "practica_actual"))
    CO, DE, SF = T["contra_regla"], T["decision"], T["sin_filtro"]
    e4 = json.loads((APP / "data" / "e3" / "etapa4.json").read_text(encoding="utf-8"))
    P4 = e4["medicion"]["principal"]
    registro = [
        ("J02", "filas de test", fijo(T["conjunto"]["filas"]), "14.211"),
        ("J02", "contactables de test", fijo(T["conjunto"]["contactables"]), "9.962"),
        ("J03", "precisión de la logística en test", pct(L["precision"], 1), "85,9 %"),
        ("J03", "precisión de la regla en test", pct(R["precision"], 1), "86,1 %"),
        ("J04", "recall de la logística en test", pct(L["recall"], 1), "85,2 %"),
        ("J04", "F1 de la logística en test", pct(L["f1"], 1), "85,5 %"),
        ("J05", "AUC-ROC de la logística en test", fijo(L["auc_roc_contactables"], 3), "0,974"),
        ("J06", "valor neto de la logística", usd(L["usd_anio"], 2), "USD 325,52"),
        ("J06", "valor neto de la regla", usd(R["usd_anio"], 2), "USD 327,06"),
        ("J07", "precisión, test − validación", fijo(T["tabla_8_1"][0]["diferencia_test_menos_validacion"] * 100, 1,
                                                     True), "+12,0"),
        ("J08", "matriz de la logística en test", " ".join(fijo(L[k]) for k in ("vp", "fn", "fp", "vn")),
         "2.147 374 353 7.088"),
        ("J09", "logística − regla en test", fijo(CO["diferencia_pp"], 2, True), "−0,25"),
        ("J09", "intervalo del 95 %", " a ".join(fijo(x, 2, True) for x in CO["ic95_pp"]), "−1,45 a +0,79"),
        ("J10", "aciertos por mes que pagan el costo", fijo(DE["aciertos_por_mes_para_pagar"]), "8.595"),
        ("J10", "la lista sigue con la regla", str(DE["sigue_la_regla"] and not DE["condicion_1"]
                                                    and not DE["condicion_2"]), "True"),
        ("J11", "sin filtro, logística − regla", fijo(SF["diferencia_pp"], 2, True), "+1,06"),
        ("J11", "sin filtro, intervalo", " a ".join(fijo(x, 2, True) for x in SF["ic95_pp"]), "+0,41 a +1,95"),
        ("J12", "proyecto completo con contactables", usd(T["roi_b_3_4"][1]["contactables"]["usd"], 2), "USD 325,52"),
        ("J13", "aciertos de la regla por mes", fijo(T["meta_y_alerta"]["regla_aciertos_por_mes"], 2), "430,67"),
        ("J14", "calibración, la lista promete", pct(T["calibracion"]["lista_500_probabilidad_media"], 1), "80,4 %"),
        ("J15", "mujeres en la lista sin filtro", pct(next(x for x in T["segmentos"]["filas"]
                                                           if x["id"] == "mujeres")["precision"], 1), "91,3 %"),
        ("J16", "variables del modelo final", fijo(T["modelo"]["variables"]), "39"),
        ("J17", "práctica actual en test", pct(PA["precision"], 1), "37,6 %"),
        ("J18", "positivos contactables por corte, test y validación",
         f"{fijo(T['conjunto']['positivos_contactables_por_corte'])} y "
         f"{fijo(T['validacion']['positivos_contactables_por_corte'])}", "504 y 392"),
        ("J19", "equilibrio de la regla en test", pct(T["equilibrio"]["s_equilibrio"], 1), "46,9 %"),
        ("J20", "versión del modelo final", T["modelo"]["version"], "1.1"),
        ("J21", "alto valor en test", fijo(next(x for x in T["segmentos"]["filas"]
                                               if x["id"] == "alto_valor")["diferencia_pp"], 1, True), "−2,7"),
        ("J22", "riesgos de la matriz", fijo(LE["riesgos"]), "13"),
        ("J50", "semanas del plan", fijo(PL["semanas"]), "20"),
        ("J51", "campaña de noviembre de 2025", MO["campanias_noviembre"][-1]["fecha"], "2025-11-12"),
        ("J52", "rojo de la alerta de drift", fijo(MO["drift"]["rojo_desde_pct"]) + " %", "42 %"),
        ("C14", "ventas de 2025 contra 2024", pct_directo(EN["variacion_ventas_2025_pct"], 1), "−35,6 %"),
        ("C08", "capacidad de contacto", " a ".join(fijo(x) for x in EN["capacidad_contacto_mes"]), "500 a 800"),
        ("H40", "puntaje legal", fijo(LE["promedio"], 1), "2,0"),
        ("C18", "envíos sin consentimiento", pct(LE["envios_sin_consentimiento_tasa"], 1), "30,1 %"),
    ]
    for id_, que, d3, doc in registro:
        if norm(d3) != norm(doc):
            mal.append(f"datos {id_}: {que} da «{d3}» y el registro dice «{doc}»")
    # el test, leído de nuevo del JSON copiado
    for clave, k4 in (("logistica_ajustada", "logistica_ajustada"), ("regla", "regla_umbral")):
        for k in ("precision", "recall", "vp", "fp", "fn", "vn", "valor_neto_anual_usd"):
            d3 = T["metodos"][clave]["test"]["usd_anio" if k == "valor_neto_anual_usd" else k]
            if d3 != P4[k4][k]:
                mal.append(f"datos: test.metodos.{clave}.test.{k} = {d3}, etapa4.json dice {P4[k4][k]}")
    if any(abs(a / 100 - b) > 1e-12 for a, b in zip(CO["ic95_pp"], P4["diferencia_logistica_menos_regla"]["ic95"])):
        mal.append("datos: test.contra_regla.ic95_pp no es el intervalo de etapa4.json")
    if e4["decision"]["resultado"] != DE["resultado"]:
        mal.append("datos: test.decision.resultado no es el de etapa4.json")
    return mal


# Lo que la vista 7 tiene que escribir cuando deja de ser esqueleto: la métrica principal del test del modelo y de
# la regla (J03). La banda, la decisión y el gráfico los fija quien la construye; esto es lo mínimo.
def pantalla_d_esperada():
    T = leer_js("datos_e3.js", "D3")["test"]["metodos"]
    return {"v07": [pct(T["logistica_ajustada"]["test"]["precision"], 1), pct(T["regla"]["test"]["precision"], 1)]}


def contenido_d(p: Pagina, esperado_d):
    for id_, textos in esperado_d.items():
        p.ir(id_)
        if p.pg.evaluate(CHEQUEO)["esqueleto"]:
            continue
        r = p.pg.evaluate(LEER_VISTA)
        pantalla = norm(r["pantalla"])
        for x in textos:
            if norm(x) not in pantalla:
                p.mal(f"{id_}: en pantalla no está «{norm(x)}» (etapa 4, J03)")
        revisar_estado(p, id_, "al llegar", r)


def abrir_navegador(pw):
    """Chromium de Playwright; si no está instalado para esta versión, el Chrome del sistema o el
    último Chromium que haya en la caché de Playwright."""
    intentos = [dict(), dict(channel="chrome")]
    cache = Path.home() / "Library" / "Caches" / "ms-playwright"
    if not cache.exists():
        cache = Path.home() / ".cache" / "ms-playwright"
    for patron in ("chromium-*/chrome-mac*/*.app/Contents/MacOS/*", "chromium-*/chrome-linux*/chrome"):
        for exe in sorted(glob.glob(str(cache / patron)), reverse=True):
            intentos.append(dict(executable_path=exe))
    ultimo = None
    for kw in intentos:
        try:
            return pw.chromium.launch(**kw)
        except PWError as e:
            ultimo = e
    raise SystemExit(f"No pude abrir un navegador para Playwright: {ultimo}")


class Pagina:
    def __init__(self, nav, w, h, problemas):
        self.url = HTML.resolve().as_uri()
        self.ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
        self.pg = self.vigilar(self.ctx.new_page())
        self.res = f"{w}x{h}"
        self.problemas = problemas

    def vigilar(self, pg):
        pg.on("console", lambda m: m.type == "error" and self.mal(f"consola: {m.text[:160]}"))
        pg.on("pageerror", lambda e: self.mal(f"error de página: {str(e)[:160]}"))
        pg.on("request", self._pedido)
        return pg

    def _pedido(self, req):
        u = req.url
        if u.startswith("data:") or u.split("#")[0].split("?")[0] == self.url:
            return
        self.mal(f"pedido de red: {u[:120]}")

    def mal(self, texto):
        self.problemas.append(f"[{self.res}] {texto}")

    def quieto(self, ms=60, pg=None):
        pg = pg or self.pg
        pg.wait_for_timeout(ms)
        pg.wait_for_function("() => !document.querySelector(':root:active-view-transition') && "
                             "document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)

    def ir(self, id_):
        self.pg.goto(f"{self.url}#{id_}")
        self.pg.wait_for_selector(".cuerpo .pant", timeout=10000)
        self.quieto(150)

    def estado(self):
        return self.pg.evaluate(ESTADO)

    def tecla(self, k, n=1):
        for _ in range(n):
            self.pg.keyboard.press(k)
            self.quieto(40)

    def cerrar(self):
        self.ctx.close()


def vistas(p: Pagina, w, h, out, capturar, sin_esqueletos=False):
    k = k_de(w, h)
    for id_ in VISTAS:
        p.ir(id_)
        if p.estado()["hash"] != f"#{id_}":
            p.mal(f"#{id_} no se abre")
        r = p.pg.evaluate(CHEQUEO)
        for x in r["problemas"]:
            p.mal(f"{id_}: {x}")
        if sin_esqueletos and r["esqueleto"]:
            p.mal(f"{id_}: sigue siendo esqueleto («se arma en la etapa siguiente»)")
        if abs(r.get("zoom", 1) - k) > 1e-3:
            p.mal(f"{id_}: zoom {r.get('zoom')}, se esperaba {k:.4f}")
        if capturar and not r["esqueleto"]:
            p.pg.screenshot(path=str(out / f"{id_}-{w}x{h}.png"))


def notas_entran(p: Pagina, w, h):
    """Con N abierto, el guion de cada vista y la línea «Sigue» entran en el panel sin desplazar."""
    p.ir("v01")
    p.tecla("n")
    for id_ in VISTAS:
        p.ir(id_)
        r = p.pg.evaluate("() => { const n = document.querySelector('.e3-notas');"
                          " return n ? { sh: n.scrollHeight, ch: n.clientHeight } : null }")
        if r is None:
            p.mal(f"notas {w}x{h}: el panel no queda abierto en #{id_}")
        elif r["sh"] > r["ch"] + 1:
            p.mal(f"notas {w}x{h}: el guion de #{id_} no entra en el panel ({r['sh']} > {r['ch']} px)")
    p.tecla("n")


def recorrido(p: Pagina):
    def esperar(cond, texto):
        if not cond:
            p.mal(f"recorrido: {texto} (estado {p.estado()})")

    p.ir("v01")
    adelante = []
    for _ in range(len(VISTAS)):
        p.tecla("ArrowRight")
        adelante.append(p.estado()["hash"])
    esperar(adelante == [f"#{v}" for v in VISTAS[1:]] + [f"#{VISTAS[-1]}"], f"→ de punta a punta dio {adelante}")
    atras = []
    for _ in range(len(VISTAS) - 1):
        p.tecla("ArrowLeft")
        atras.append(p.estado()["hash"])
    esperar(atras == [f"#{v}" for v in reversed(VISTAS[:-1])], f"← de punta a punta dio {atras}")
    p.ir("v04")
    p.tecla("PageDown")
    esperar(p.estado()["hash"] == "#v05", "Av Pág no pasa a la vista siguiente")
    p.tecla("PageUp")
    esperar(p.estado()["hash"] == "#v04", "Re Pág no vuelve a la anterior")
    p.tecla("End")
    esperar(p.estado()["hash"] == f"#{VISTAS[-1]}", "Fin no lleva a la última")
    p.tecla("Home")
    esperar(p.estado()["hash"] == "#v01", "Inicio no lleva a la primera")
    # una tecla mantenida (el control remoto repite) no recorre el tablero
    p.ir("v01")
    for _ in range(10):
        p.pg.keyboard.down("PageDown")
        p.pg.wait_for_timeout(20)
    p.pg.keyboard.up("PageDown")
    p.quieto()
    esperar(p.estado()["hash"] == "#v02", f"Av Pág mantenida desde la 1 llega a {p.estado()['hash']}")
    # el riel lleva a cada vista y la marca la activa
    p.ir("v01")
    p.pg.locator(".lat-item", has_text="Se paga").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#v05" and p.estado()["activa"] == "05", "el riel no lleva a la 5")
    p.pg.locator(".lat-item", has_text="Matriz de riesgos").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#a4", "el riel no lleva al A4")
    # con el foco en el riel después de un clic, las flechas siguen pasando de vista
    p.tecla("ArrowUp")
    esperar(p.estado()["hash"] == "#a3", "con el foco en el riel, ↑ no vuelve a la anterior")
    # URL: recargar no pierde el lugar; Atrás recorre
    p.pg.reload()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#a3", "recargar pierde la vista")
    p.pg.go_back()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#a4", "Atrás del navegador no vuelve a la vista anterior")
    # notas: N las abre con el guion de C3 y no tapan el tablero
    p.ir("v05")
    p.tecla("n")
    esperar(p.estado()["notas"], "N no abre las notas")
    if p.estado()["notas"]:
        vp = p.pg.locator(".e3-vp").bounding_box()
        notas = p.pg.locator(".e3-notas").bounding_box()
        esperar(vp["y"] + vp["height"] <= notas["y"] + 1, "las notas tapan el tablero")
        txt = p.pg.locator(".e3-notas").inner_text()
        esperar("Francisco C." in txt and "dólares" in txt, "las notas de la 5 no traen el guion de las diapositivas 8 y 9")
        fit = p.pg.evaluate("() => window.__fit().problemas.filter((x) => !/scroll-contenedor/.test(x.tipo) || !/e3-notas/.test(x.detalle))")
        esperar(not fit, f"con las notas abiertas el tablero desborda: {fit}")
        # el riel no se encima con su pie: la ventana lógica sigue en 640 de alto o más
        riel = p.pg.evaluate("() => { const l = [...document.querySelectorAll('.lat-item')].pop().getBoundingClientRect();"
                             " const pie = document.querySelector('.lat-pie').getBoundingClientRect(); return l.bottom <= pie.top + 1 }")
        esperar(riel, "con las notas abiertas el riel se encima con su pie")
        p.tecla("n")
        esperar(not p.estado()["notas"], "N no cierra las notas")
    # pantalla en negro: «.» y B; cualquier tecla vuelve sin cambiar de vista
    for k in (".", "b"):
        p.tecla(k)
        esperar(p.estado()["negro"], f"«{k}» no pone la pantalla en negro")
        p.tecla("PageDown")
        e = p.estado()
        esperar(not e["negro"] and e["hash"] == "#v05", f"después de «{k}», una tecla no vuelve o cambia de vista")
    # F5 (el botón del control remoto) no recarga
    p.pg.evaluate("() => { window.__sin_recarga = 1 }")
    p.tecla("F5")
    esperar(p.pg.evaluate("() => window.__sin_recarga === 1") and p.estado()["hash"] == "#v05", "F5 recarga la página")
    # dos ventanas se siguen; la de notas (?notas) sigue al tablero
    p.ir("v05")
    otra = p.vigilar(p.ctx.new_page())
    otra.goto(f"{p.url}#v01")
    otra.wait_for_selector(".cuerpo .pant")
    otra.wait_for_timeout(300)
    esperar(otra.evaluate("() => location.hash") == "#v05", f"la ventana nueva no toma la vista de la abierta ({otra.evaluate('() => location.hash')})")
    p.tecla("PageDown")
    otra.wait_for_timeout(400)
    esperar(otra.evaluate("() => location.hash") == "#v06", "la otra ventana no sigue a la 6")
    otra.keyboard.press("PageUp")
    otra.wait_for_timeout(400)
    esperar(p.estado()["hash"] == "#v05", "la primera ventana no sigue a la otra")
    otra.close()
    notas = p.vigilar(p.ctx.new_page())
    notas.goto(f"{p.url}?notas#v01")
    notas.wait_for_selector(".e3-notas-ventana")
    notas.wait_for_timeout(300)
    esperar("¿Se paga?" in notas.inner_text(".e3-notas-ventana"), "la ventana de notas no toma la vista abierta")
    p.tecla("PageDown")
    notas.wait_for_timeout(400)
    esperar("¿Es legal y seguro?" in notas.inner_text(".e3-notas-ventana"), "la ventana de notas no sigue al tablero")
    notas.close()


def hoja(nav, destino: Path, ids):
    """Hoja de contacto: cada vista a 1536 × 864, dos por fila, con su número y su pregunta arriba."""
    from PIL import Image, ImageDraw, ImageFont
    w, h = 1536, 864
    p = Pagina(nav, w, h, [])
    tomas = []
    try:
        for id_ in ids:
            p.ir(id_)
            f = destino.parent / f".{id_}-{w}.png"
            destino.parent.mkdir(parents=True, exist_ok=True)
            p.pg.screenshot(path=str(f))
            tomas.append((id_, p.pg.evaluate("() => document.querySelector('.e2-preg').textContent"), f))
    finally:
        p.cerrar()
    sep, cab, cols = 24, 44, 2
    filas = (len(tomas) + cols - 1) // cols
    lienzo = Image.new("RGB", (cols * w + (cols - 1) * sep, filas * (h + cab) + (filas - 1) * sep), (255, 255, 255))
    d = ImageDraw.Draw(lienzo)
    try:
        fuente = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    except OSError:
        fuente = ImageFont.load_default()
    for i, (id_, preg, f) in enumerate(tomas):
        x, y = (i % cols) * (w + sep), (i // cols) * (h + cab + sep)
        d.text((x + 12, y + 10), f"/e3/ · vista {id_[1:].lstrip('0')} · {preg} · {w} × {h}", fill=(22, 35, 58), font=fuente)
        lienzo.paste(Image.open(f).convert("RGB"), (x, y + cab))
        f.unlink()
    lienzo.save(destino)
    print(f"hoja de contacto: {destino}")


def main():
    esperado, guion = contenido_esperado()
    esperado_d = pantalla_d_esperada()
    ap = argparse.ArgumentParser()
    ap.add_argument("--capturas", default=str(APP / "e3" / "capturas-verif"))
    ap.add_argument("--sin-capturas", action="store_true")
    ap.add_argument("--sin-esqueletos", action="store_true",
                    help="falla si alguna vista sigue como esqueleto (obligatorio desde W3 y antes de exportar)")
    ap.add_argument("--hoja", help="arma una hoja de contacto de las vistas a 1536 × 864 en esta ruta")
    ap.add_argument("--hoja-vistas", default=",".join(HISTORIA), help="vistas de la hoja, separadas por coma")
    a = ap.parse_args()
    if not HTML.exists():
        sys.exit(f"Falta {HTML.relative_to(APP)}: corre «npm run build:e3».")
    out = Path(a.capturas)
    if not a.sin_capturas:
        out.mkdir(parents=True, exist_ok=True)
    problemas: list[str] = anclas_datos()
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        for w, h in RES:
            p = Pagina(nav, w, h, problemas)
            try:
                vistas(p, w, h, out, (w, h) in CAPTURAR and not a.sin_capturas, a.sin_esqueletos)
                contenido(p, esperado)
                contenido_d(p, esperado_d)
                if (w, h) in NOTAS_RES:
                    notas_entran(p, w, h)
                    guion_en_notas(p, w, h, guion)
                if (w, h) == (1536, 864):
                    recorrido(p)
            except PWError as e:
                p.mal(f"excepción de Playwright: {str(e).splitlines()[0][:160]}")
            finally:
                p.cerrar()
        if a.hoja:
            hoja(nav, Path(a.hoja), a.hoja_vistas.split(","))
        nav.close()
    if problemas:
        print(f"{len(problemas)} problemas:")
        for x in problemas:
            print("  " + x)
        sys.exit(1)
    if not a.sin_capturas:
        print(f"capturas en {out}")
    print("E3 OK")


if __name__ == "__main__":
    main()
