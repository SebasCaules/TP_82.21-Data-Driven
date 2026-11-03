"""Verifica /e3/ (dist-e3/index.html), abierto por file://, sin servidor.

    npm run build:e3 && python3 scripts/verificar_e3.py [--capturas DIR] [--sin-capturas] [--sin-esqueletos]
                                                        [--hoja RUTA [--hoja-vistas v01,…]]

(27/10, W1) Rehecho para el armazón del E2 (riel, encabezado con la pregunta, banda de cifras, zoom
uniforme de e3/src/zoom.js). La paridad con /e2/ la mide scripts/paridad_e3.py; esto cubre lo demás:

1. Cada vista del riel (V01 a V10; sin el respaldo A1 a A7 desde el 02/11) a 1152×640, 1280×720, 1366×768, 1536×864 y 1920×1080:
   - monta, la página no scrollea y window.__fit() (src/fit.js) no encuentra desbordes;
   - el zoom es el declarado: k = máx(1; mín(1,2; ancho / 1152; alto / 640));
   - (01/11) nada detrás de un botón: ninguna vista ni anexo tiene el botón que abría paneles (.e3-explorar) ni la
     palabra «Explorar» en pantalla o en un title, y (02/11) ninguna vista tiene controles (el simulador del A3 salió
     con el respaldo); ninguna tabla en svg desborda (data-desborda). Las vistas
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
   - la tarjeta de decisión dice el «área · estado» de su decisión en e3/src/decisiones.js (F6b, 28/10: hasta
     ese día, el id interno, «D-PRO · propuesta», que ningún documento define; hallazgo H-2-077);
   - las cifras de la banda, en orden, son las de su fila del registro, una por tarjeta; hay una sola al
     tamaño máximo, en la tarjeta central, y la central es la primera, a la izquierda (N0-6 del 28/10); la
     cifra central no se repite en otra vista (regla 3 del plan del 28/10);
   - cada rótulo de la banda tiene 22 caracteres o menos y cada fragmento debajo de la cifra, de 2 a 6
     palabras y sin otro número (regla 2 y N0-8 del 28/10; la vista 6, «cada dimensión en 2», lo pide el
     plan);
   - el gráfico tiene su conclusión arriba (.e3-conclusion) y escribe sus valores clave (28/10: lo que vuelve
     hoy, lo que haría falta y las veces; los días del cliente; las condiciones técnicas con su puntaje; las
     dos filas de test con su veredicto; el costo y el beneficio de la regla; los envíos sin consentimiento;
     la regla del piloto en dos zonas), y no escribe lo que el plan sacó (las cifras de la banda en la
     vista 3, validación en la 4 al llegar, el costo con modelo en la 5);
   - el terracota, solo en la vista 6 (la excepción: sin consentimiento); en la 3, solo la capacidad humana
     en --acc;
   - en pantalla, ni «pendiente», «abierto», «a definir», «sin respuesta» ni «espera respuesta» (tampoco
     en los title), ni códigos internos («envío 29», «G40»: regla 13 H13 del E2);
   - ningún texto de un gráfico pisa a otro;
   - (01/11) lo que hasta ese día iba detrás de un botón se busca a la vista, donde quedó (sección 8);
   - (a 1366×768 y 1536×864, con N) las notas traen el guion de cada diapositiva de la vista, con quién
     lo dice.

6. (W2) Con --hoja, una hoja de contacto de las vistas con contenido (por defecto, de la 1 a la 7) a
   1536 × 864, dos por fila, para mirarla de una vez.
7. (27/10, W3) Datos de la Parte D, sin navegador: D3 trae las filas J01 a J22, J50, J51, J53 y las cinco cifras de las
   vistas 2 y 6 que antes solo tenía C3 (C14, C08, H40, C18, J22); cada valor, escrito con formato.js, da lo que
   dice el registro, y los del test coinciden con data/e3/etapa4.json.
8. (27/10, crítica del W3, hallazgo 13) Lo que quedó a la vista el 01/11, en cada resolución: los paneles que la
   crítica encontró mal (la vista 4 en test y en validación, la 7 al llegar) escriben lo que dicen D3 y C3, y no
   escriben lo que la crítica sacó (el grupo de control como decisión de María G.). (01/11) Lo que iba detrás de un
   botón se busca donde quedó, al llegar: la diferencia en validación y test (vista 4), el MVP (vista 3), el costo con
   modelo y el presupuesto (vista 5), las cinco dimensiones y el plan (vista 6) y el flujo, el plan y lo que decide
   María G. con su semana (vista 8). (02/11) Sin el respaldo A1 a A7, lo vital de los anexos se busca en su vista: el
   test medido una vez (A1, vista 4), el valor de cada caso y la sensibilidad (A7 y A3, vista 5) y los riesgos
   críticos de los 13 con su umbral (A4, vista 6). El riel no trae ningún anexo.
9. (01/11) Sin navegador: «Explorar» no aparece en el tablero armado (dist-e3/index.html) ni en las fuentes de /e3/
   (e3/src, también el texto generado contenido_e3.js).
10. (01/11, W5) La corrección al Grupo 5, en cada resolución, contra D3.correccion (correcciones.json de _build/E/):
   la vista 9 escribe el total en «Revisar» sobre las secciones, el conteo de cada parte y, de las cinco observaciones
   de más peso, el título, la sección con su página, la cita y la corrección; la terracota marca solo lo que está en
   «Revisar» (la tarjeta central, las celdas de esas secciones y el número de cada observación). La vista 10 escribe
   el total en «Completo», lo que hacen bien con su sección y las dos reglas; sin terracota. (01/11, planilla v2.0) La
   sección de cada observación es la puntual que escribe la planilla («A 2.2 · pág. 18»; la carátula, «General ·
   pág. 1»), y la vista 10 escribe el target de cada grupo con el AUC-ROC en validación de su regla y de su modelo, y
   no escribe «sí o no» (su regla también ordena: verificacion-2.json, «cruce-regla»). En las dos, ni
   «pendiente» ni «abierto» ni códigos internos (revisar_estado). Sus cifras no salen de nuestras partes: las controla
   presentacion/verificar.py --web contra el texto de la planilla y del PDF del Grupo 5.

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
HISTORIA = [f"v{i:02d}" for i in range(1, 11)]  # 01/11: la V08, y la V09 y la V10 de la corrección al Grupo 5 (W5)
VISTAS = HISTORIA   # (02/11) sin el respaldo A1 a A7
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
  // (01/11) nada detrás de un botón: ni el botón, ni la palabra; (02/11) ni controles: el simulador del A3 salió
  if (document.querySelector('.e3-explorar')) p.push('hay un botón «Explorar» (.e3-explorar)')
  const vp = document.querySelector('.e3-vp')
  const titulos = [...vp.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
    .concat([...vp.querySelectorAll('svg title')].map((e) => e.textContent))
  if (/explorar/i.test(vp.innerText) || titulos.some((x) => /explorar/i.test(x || '')))
    p.push('la palabra «Explorar» en pantalla o en un title')
  if (!esqueleto && document.querySelector('.cuerpo [role=slider], .cuerpo [role=radiogroup], .cuerpo input'))
    p.push('controles en la vista (desde el 02/11 ninguna tiene)')
  if (document.querySelector('.cuerpo svg[data-desborda]')) p.push('una tabla en svg no entra (data-desborda)')
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
            estados[f"{letra}-{area[:3].upper()}"] = (
                t["area"], (t["escala"] if t["valor"][:1].isdigit() else t["valor"]).lower())
    for id_, area_, est in re.findall(r"\{ id: '([A-Z]-[A-Z]{3})', area: '([^']*)', estado: '([^']*)' \}",
                                      (SRC / "decisiones.js").read_text()):
        estados[id_] = (area_, est)
    T, E, C, MD = D3["tecnica"], D3["economia"], D3["caso"], D3["modelos"]
    TE, P, PL = D3["test"], D3["piloto"], D3["plan"]   # W3: la etapa 4, el piloto y el plan (Parte D)
    tope = fijo(T["escala"][-1]["hasta"], 0)
    leg = next(t for t in dia[2]["tarjetas"] if t["area"] == "Legal")

    LE, U, CO, SF = D3["legal"], E["umbral"], TE["contra_regla"], TE["sin_filtro"]
    pp = lambda x: fijo(x, 2, True)                       # noqa: E731
    ic = lambda par: [pp(x) for x in par]                 # noqa: E731
    puntaje = lambda x: str(int(x)) if float(x).is_integer() else str(x)   # noqa: E731 (`${x}` de JS)
    limite = next(c for c in T["condiciones"] if c["id"] == "capacidad_humana")
    ids_l = sorted((a["id"] for t in dia[10]["plan"] for a in t["acciones"]), key=lambda x: int(x[1:]))
    dims = LE["dimensiones"]
    parejas = all(d["puntaje"] == dims[0]["puntaje"] for d in dims)
    # (28/10, .workforce/PLAN.md del E3, auditoría de contraste y gráficos) Por vista: la decisión; las cifras de la
    # banda en orden, la central primero (N0-6); lo que el gráfico tiene que escribir al llegar y lo que no; las
    # y, si la hay, la excepción a la regla del fragmento sin número.
    esperado = {
        # la central, el ROI del modelo sobre la regla (G40); el gráfico, lo que vuelve hoy (1,02 %, «techo, sin
        # control») contra lo que haría falta para pagarse (49,6 %), 48,6 veces; sale «lo mide el piloto»
        "v01": dict(dec="D-PRO",
                    cifras=[pct_directo(E["observada"]["modelo_roi_pct"], 2), f"{fijo(T['promedio'], 2)}/{tope}",
                            plano(leg["valor"])],
                    grafico=[pct(E["parametros"]["s_observada"], 2), pct(U["s_equilibrio_con_descuento"], 1),
                             f"{fijo(U['veces_con_descuento'], 1)} veces", "techo, sin control",
                             "Haría falta para pagar la regla"],
                    # (02/11, DAT-01) la barra nombra a la regla; «lo que se ve hoy» salió de la cota
                    sin=["lo mide el piloto", "Haría falta para pagarse", "lo que se ve hoy"]),
        # la central, la parte que se va en 90 días (J02, test.conjunto.tasa), sola; la línea de tiempo, igual
        "v02": dict(dec="A-UMB", cifras=[pct(TE["conjunto"]["tasa"], 2)],
                    grafico=[f"{fijo(C['recency_dias'])} días sin comprar", f"umbral {fijo(C['umbral_dias'])} días",
                             f"faltaban {fijo(C['dias_para_cruzar'])}"] + (["se va"] if C["cruzo_en_la_ventana"] else [])),
        # tarjeta de puntaje: una fila por condición, sin repetir las cifras de la banda; el puntaje, en el aria-label
        "v03": dict(dec="A-TEC",
                    cifras=[f"{fijo(T['promedio'], 2)}/{tope}", fijo(T["positivos_entrenamiento"]),
                            pct_directo(T["ventas_sin_cliente_pct"], 1)],
                    grafico=[c["nombre"] for c in T["condiciones"]],
                    sin=[fijo(T["positivos_entrenamiento"]), pct_directo(T["ventas_sin_cliente_pct"], 1)],
                    aria=[f"{c['nombre']}: {puntaje(c['puntaje'])} de {tope}" for c in T["condiciones"]],
                    acc=[limite["nombre"]]),
        # la central, la lista que sale en test (J09); para pagar el modelo (J10). El gráfico (01/11), las cuatro filas:
        # sin filtrar y la lista que sale, en validación (H06 y la de J09) y en test (J11 y J09), con su veredicto.
        # (02/11, W6: VIS-03, UX-19, VIS-08, VIS-09) el eje dice que son puntos de precisión; bajo el eje, hacia qué lado
        # gana cada uno; los extremos del intervalo, solo en la fila que decide (los de las otras tres salen)
        "v04": dict(dec="C-MOD",
                    cifras=[f"{pp(CO['diferencia_pp'])} puntos",
                            f"{fijo(TE['decision']['aciertos_por_mes_para_pagar'])} aciertos extra/mes"],
                    # (03/11) las filas, agrupadas por lista: el nombre y el subrótulo una vez por grupo, el período en
                    # cada fila (los nombres completos, en el aria-label)
                    grafico=["Sin filtrar", "Lista que sale", "validación", "test", pp(SF["diferencia_pp"]),
                             pp(CO["diferencia_pp"]),
                             pp(D3["lista"]["modelo_menos_regla_500_sin_filtro"]["diferencia_pp"]),
                             pp(CO["validacion_diferencia_pp"])]
                    + ic(CO["ic95_pp"]) + ["empate", "gana la logística", "gana la regla", "← gana la regla",
                                           "gana la logística →", "Logística menos regla (puntos de precisión)",
                                           "no se puede mandar"],
                    sin=ic(SF["ic95_pp"]) + ic(D3["lista"]["modelo_menos_regla_500_sin_filtro"]["ic95_pp"])
                    + ic(CO["validacion_ic95_pp"])),
        # la central, el ROI de la regla sola (G41), que no repite el de la vista 1; lo que suma y lo que cuesta el
        # modelo, separados. El gráfico (01/11), el costo del año 1 con modelo y con la regla sola contra el beneficio
        # de la regla, con la línea del presupuesto. (02/11, W6: VIS-12) sin el título de eje «Dólares»; (03/11, pedido
        # del usuario: ejes rotulados) vuelve
        "v05": dict(dec="B-ECO",
                    cifras=[pct_directo(E["observada"]["regla_roi_pct"], 2), usd(E["observada"]["modelo_usd"], 2),
                            fijo(E["costos"]["incremental_usd"])],
                    grafico=["Costo año 1, con modelo", usd(E["costos"]["con_modelo"]["total_anio_1_usd"]),
                             "Costo año 1, regla sola", usd(E["costos"]["regla_sin_modelo"]["total_anio_1_usd"]),
                             "Beneficio anual de la regla", usd(E["observada"]["regla_usd"], 2),
                             f"presupuesto {usd(E['costos']['presupuesto_usd'])}", "Dólares"]),
        # la central, el puntaje legal (H40); los envíos sin consentimiento (C18) y los riesgos críticos (J22). El
        # gráfico, la barra 100 % con el 30,1 % en terracota
        "v06": dict(dec="C-LEG",
                    cifras=[plano(dia[10]["promedio"]["valor"]), pct(LE["envios_sin_consentimiento_tasa"], 1),
                            fijo(LE["riesgos_criticos"])],
                    grafico=[pct(LE["envios_sin_consentimiento_tasa"], 1), "Hasta hoy", "Nuestra lista",
                             "la lista sale sin ellos"] + ids_l,
                    terracota=True,
                    fragmento=({0: f"cada dimensión en {fijo(dims[0]['puntaje'])}"} if parejas else {})),
        # la central, lo que tiene que dar el piloto (H49); (02/11, W6: COB-14, ORA-09, UX-24) el grupo de control
        # (G49), «80 por mes, sin contactar»: la excepción de la regla del fragmento la pide hallazgos.md. Salen el
        # tamaño (1.260) y las semanas (J50). El gráfico, la regla en dos zonas con la subfranja de 0 a 2,87; el 2,87
        # con «mínimo que se distingue» (VIS-11) y el puente de C3 debajo del 40,4 (COB-09, ORA-05, UX-02)
        "v07": dict(dec="D-PIL",
                    cifras=[f"{fijo(P['umbral_produccion_pp'], 1)} puntos", fijo(P["control"])],
                    grafico=[fijo(P["diferencia_detectable_pp"], 2), fijo(P["umbral_produccion_pp"], 1),
                             "mínimo que se distingue", "María G. elige", "a producción", plano(dia[12]["puente"])],
                    sin=["no se distingue de cero", "la lista se paga"],
                    fragmento={1: f"{fijo(P['control_mes'])} por mes, sin contactar"}),
        # (01/11) la central, la semana de la primera lista (J50, hito 6). (02/11, W6: DAT-11, UX-22) Después, los
        # criterios de go-live contados en C3 (los hitos con criterio) y la semana del operador de después. El gráfico
        # (VIS-01, UX-03): el flujo de C3 (D13.flujo) y la línea de hitos de 20 semanas (D13.hitos, un marcador por
        # semana con hito, con su número), con la llave de go-live; salen el Gantt y lo que decide María G.
        "v08": dict(dec="D-PLA",
                    cifras=[f"semana {PL['hitos_semana']['go_live']}",
                            fijo(sum(1 for h in dia[13]["hitos"] if h["criterio"])),
                            f"semana {PL['hitos_semana']['operador_despues_del_piloto']}"],
                    grafico=[plano(x["titulo"]) for x in dia[13]["flujo"]]
                    + [plano(dia[13]["rotulo_hitos"]), plano(dia[13]["llave_go_live"])],
                    # cada marcador de la línea de hitos: un texto del svg que es solo el número de su semana
                    exactos=sorted({fijo(PL["hitos_semana"][h["clave"]]) for h in dia[13]["hitos"]}, key=int),
                    sin=[f["nombre"] for f in PL["fases"] if f["id"] != "piloto"]
                    + ["Lo que decide María G.", "1 · Exportar"]),
    }
    out = {}
    for v, e in esperado.items():
        rot, est = estados.get(e["dec"], ("¿?", "¿?"))
        out[v] = {"dec": f"{rot} · {est}", "cifras": [norm(x) for x in e["cifras"]],
                  "grafico": [norm(x) for x in e["grafico"]], "sin": [norm(x) for x in e.get("sin", [])],
                  "aria": [norm(x) for x in e.get("aria", [])], "acc": e.get("acc"),
                  "terracota": e.get("terracota", False),
                  "fragmento": e.get("fragmento", {}), "exactos": [norm(x) for x in e.get("exactos", [])]}
    # el guion de cada vista: el comienzo de lo que dice, por diapositiva (vistas/index.jsx); (02/11, ORA-22) sin quién
    de = dict(re.findall(r"\{ id: '(V\d\d)'.*?de: \[([\d, ]*)\]", (SRC / "vistas" / "index.jsx").read_text()))
    guion = {}
    for v, ns in de.items():
        ds = [dia[int(n)] for n in re.findall(r"\d+", ns)]
        guion[v.lower()] = [(d["n"], norm(plano(d["guion"]))[:40]) for d in ds]
    return out, guion


LEER_VISTA = r"""() => {
  const q = (s) => document.querySelector(s)
  const banda = [...document.querySelectorAll('.e2-banda-cifras .par-val')].map((e) => e.textContent)
  const grandes = [...document.querySelectorAll('.e2-banda-cifras .e2-cifra:not(.sec)')]
  const tarjetas = [...document.querySelectorAll('.e2-banda-cifras > .tarjeta')]
  // un color de la hoja, como lo devuelve getComputedStyle (rgb), resuelto dentro de la caja del zoom
  const color = (v) => {
    const el = document.createElement('i'); el.style.color = `var(${v})`; q('.e3-vp').appendChild(el)
    const c = getComputedStyle(el).color; el.remove(); return c
  }
  const ACC = color('--acc'), TERRA = [color('--terra'), color('--terra-osc')]
  const svgs = [...document.querySelectorAll('.cuerpo .lienzo svg')].filter((s) => !s.parentElement.closest('svg'))
  const textosSvg = svgs.flatMap((s) => [...s.querySelectorAll('text')].map((t) => t.textContent))
  const aria = svgs.map((s) => s.getAttribute('aria-label') ?? '').join(' | ')
  // textos del gráfico en --acc (sin contar los <tspan>: heredan) y marcas en terracota
  const enAcc = svgs.flatMap((s) => [...s.querySelectorAll('text')]
    .filter((t) => getComputedStyle(t).fill === ACC).map((t) => t.textContent.trim()))
  const terracota = svgs.flatMap((s) => [...s.querySelectorAll('*')]).filter((el) => {
    const cs = getComputedStyle(el); return TERRA.includes(cs.fill) || TERRA.includes(cs.stroke)
  }).length
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
    centralPrimera: tarjetas.length > 0 && tarjetas[0].classList.contains('e2-central')
      && tarjetas[0].contains(grandes[0] ?? null),
    porTarjeta: tarjetas.map((t) => t.querySelectorAll('.par-val').length),
    rotulos: tarjetas.map((t) => t.querySelector('.kpi-lbl > span')?.textContent.trim() ?? ''),
    lineas: tarjetas.map((t) => t.querySelector('.e2-linea')?.textContent ?? ''),
    conclusion: q('.cuerpo .pant > .tarjeta .e3-conclusion')?.textContent ?? null,
    graficos: svgs.length, textosSvg, pisan, aria, enAcc, terracota,
    pantalla: vp.innerText + '\n' + textosSvg.join('\n'), cuerpo: q('.cuerpo').innerText + '\n' + textosSvg.join('\n'),
    titulos,
    explorar: exp ? exp.getAttribute('aria-expanded') : null,
    opciones: [...document.querySelectorAll('.cuerpo .e3-opciones [role=radio]')].length,
    opcionesTxt: [...document.querySelectorAll('.cuerpo .e3-opciones [role=radio]')].map((e) => e.textContent.trim()),
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
    centrales = {}
    for id_, e in esperado.items():
        p.ir(id_)
        r = p.pg.evaluate(LEER_VISTA)
        if norm(r["dec"]) != norm(e["dec"]):
            p.mal(f"{id_}: la decisión dice «{r['dec']}», se esperaba «{e['dec']}»")
        banda = [norm(x) for x in r["banda"]]
        if banda != e["cifras"]:
            p.mal(f"{id_}: la banda dice {banda}, se esperaba {e['cifras']}")
        # un número por tarjeta (regla 2 del 28/10)
        if r["porTarjeta"] != [1] * len(e["cifras"]):
            p.mal(f"{id_}: cifras por tarjeta de la banda {r['porTarjeta']}, se esperaba {[1] * len(e['cifras'])}")
        if not r["grandeCentral"]:
            p.mal(f"{id_}: {r['grandes']} cifras al tamaño máximo; tiene que haber una, en la tarjeta central")
        elif not r["centralPrimera"]:
            p.mal(f"{id_}: la cifra central no está en la primera tarjeta de la banda (N0-6)")
        if banda:
            centrales.setdefault(banda[0], []).append(id_)
        for i, rot in enumerate(r["rotulos"]):
            if len(rot) > 22:
                p.mal(f"{id_}: el rótulo «{rot}» tiene {len(rot)} caracteres (22 o menos)")
        for i, lin in enumerate(r["lineas"]):
            lin = norm(lin)
            if i in e["fragmento"]:
                if lin != norm(e["fragmento"][i]):
                    p.mal(f"{id_}: el fragmento de la tarjeta {i + 1} dice «{lin}», se esperaba «{e['fragmento'][i]}»")
                continue
            if not 2 <= len(lin.split()) <= 6:
                p.mal(f"{id_}: el fragmento «{lin}» tiene {len(lin.split())} palabras (de 2 a 6)")
            if re.search(r"\d", lin):
                p.mal(f"{id_}: el fragmento «{lin}» trae otro número (N0-8)")
        if r["graficos"] != 1:
            p.mal(f"{id_}: {r['graficos']} gráficos al llegar")
        if not norm(r["conclusion"]):
            p.mal(f"{id_}: el gráfico no tiene su conclusión arriba (.e3-conclusion)")
        svg = norm(" | ".join(r["textosSvg"]))
        for x in e["grafico"]:
            if x not in svg:
                p.mal(f"{id_}: el gráfico no escribe «{x}»")
        solos = {norm(t) for t in r["textosSvg"]}
        for x in e["exactos"]:
            if x not in solos:
                p.mal(f"{id_}: el gráfico no tiene un texto que sea solo «{x}»")
        for x in e["sin"]:
            if x.casefold() in svg.casefold():
                p.mal(f"{id_}: el gráfico sigue escribiendo «{x}»")
        aria = norm(r["aria"])
        for x in e["aria"]:
            if x not in aria:
                p.mal(f"{id_}: el aria-label del gráfico no dice «{x}»")
        if e["acc"] is not None and sorted(set(norm(x) for x in r["enAcc"])) != sorted(e["acc"]):
            p.mal(f"{id_}: en --acc el gráfico escribe {sorted(set(r['enAcc']))}, se esperaba solo {e['acc']}")
        if not e["terracota"] and r["terracota"]:
            p.mal(f"{id_}: {r['terracota']} marcas del gráfico en terracota (solo la excepción, vista 6)")
        elif e["terracota"] and not r["terracota"]:
            p.mal(f"{id_}: la excepción no va en terracota")
        revisar_estado(p, id_, "al llegar", r)
        if r["explorar"] is not None:
            p.mal(f"{id_}: tiene el botón «Explorar» (01/11: nada detrás de un botón)")
    for cifra, vs in centrales.items():
        if len(vs) > 1:
            p.mal(f"la cifra central «{cifra}» se repite en {', '.join(vs)} (regla 3)")


def guion_en_notas(p: Pagina, w, h, guion):
    """Con N abierto, las notas de cada vista traen el comienzo del guion de cada diapositiva. (02/11, ORA-22) Sin el
    nombre de quien habla: el guion va sin división por persona."""
    p.ir("v01")
    p.tecla("n")
    for id_, partes in guion.items():
        p.ir(id_)
        txt = norm(p.pg.evaluate("() => document.querySelector('.e3-notas')?.innerText ?? ''"))
        for n, comienzo in partes:
            if comienzo not in txt:
                p.mal(f"notas {w}x{h}: #{id_} no trae el guion de la diapositiva {n} («{comienzo}…»)")
        if p.pg.locator(".e3-notas-quien").count():
            p.mal(f"notas {w}x{h}: #{id_} muestra quién habla (ORA-22)")
    p.tecla("n")


# ---------------------------------------------------------------- 6. datos de la Parte D (W3)

# Filas del registro que D3 tiene que traer desde W3: la etapa 4 (J01 a J21), la matriz de riesgos (J22), el plan
# (J50), la campaña de noviembre (J51), la alerta de drift (J53 desde el 28/10, F6b; hasta la D v1.2, J52) y las cinco
# cifras de las vistas 2 y 6 que hasta W2 solo estaban en el texto de C3 (C14, C08, H40, C18; J22 es la quinta).
IDS_D = [f"J{i:02d}" for i in range(1, 23)] + ["J50", "J51", "J53", "C14", "C08", "H40", "C18"]


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
        ("J53", "suba que dispara la alerta de drift", fijo(MO["drift"]["umbral_suba_pp"], 1) + " puntos", "2,1 puntos"),
        ("J53", "en riesgo sobre elegibles al 31/12/2025", pct(MO["drift"]["referencia"], 1), "50,4 %"),
        ("J50", "María G. designa quién inscribe las bases", f"semana {PL['hitos_semana']['designa_l1']}", "semana 2"),
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


# ---------------------------------------------------------------- 8. lo que quedó a la vista (W3, 01/11 y 02/11)

def a_la_vista_esperado():
    """(vista, None, textos que tiene que escribir, textos que no puede escribir), calculado desde D3 y C3. (01/11) Todo
    se mira al llegar: ninguna vista tiene nada detrás de un botón. (02/11) Sin el respaldo: lo vital de los anexos A1,
    A3, A4 y A7 se busca en las vistas 4, 5 y 6."""
    D3 = leer_js("datos_e3.js", "D3")
    C3 = leer_js("contenido_e3.js", "C3")
    if "ANEXOS" in C3:
        raise SystemExit("C3 trae ANEXOS: desde el 02/11 exportar_web.py exporta solo RIESGOS")
    T, E, PL, LE = D3["test"], D3["economia"], D3["plan"], D3["legal"]
    dia = {d["n"]: d for d in C3["DIAPOSITIVAS"]}
    CO, SF, SFV = T["contra_regla"], T["sin_filtro"], D3["lista"]["modelo_menos_regla_500_sin_filtro"]
    ids_l = sorted((a["id"] for t in dia[10]["plan"] for a in t["acciones"]), key=lambda x: int(x[1:]))
    d5 = dia[5]
    d11 = dia[11]
    C = D3["caso"]
    d12, d13 = dia[12], dia[13]
    return [
        # (02/11, W6) la vista 1: la conclusión dice qué se paga (DAT-01) y la decisión abre con el veredicto (COB-01)
        ("v01", None, ["Para que la regla se pague", "Viable:"], ["Para pagarse,"]),
        # (02/11, W6) la vista 2: la línea de definición define la regla y el 500, con el período del 25,35 % (ORA-03,
        # DAT-07); el id del cliente, solo en el title (VIS-15)
        # (03/11, pedido del usuario) sin la línea de definición: el título dice que es un cliente de ejemplo
        ("v02", None, ["Un cliente real, de ejemplo"],
         [C["id_cliente"], "La regla toma a los 500"]),
        # (01/11) la vista 4: las cuatro filas, validación (H06 y la de J09) y test, al llegar; (02/11, del A1) el test,
        # medido una vez. (02/11, W6) qué mide dice precisión (VIS-03, UX-05); la partición de la A 2.2 (COB-04) y, al
        # pie, lo que acierta la lista que sale en test y la lista de 800 (COB-03, COB-04), de la diapositiva 6
        # (03/11, pedido del usuario: el forest tenía mucho texto) filas agrupadas por lista; qué mide dice los dos
        # períodos; salen la partición y la lista de 800 (al title)
        ("v04", None, ["Sin filtrar", "Lista que sale", "validación", "test", "no se puede mandar",
                       fijo(SFV["diferencia_pp"], 2, True), fijo(SF["diferencia_pp"], 2, True),
                       fijo(CO["validacion_diferencia_pp"], 2, True), fijo(CO["diferencia_pp"], 2, True),
                       "gana la regla", "gana la logística", "empate", "medido una vez",
                       "de precisión: empata", "ni una lista perfecta lo paga",
                       "En la lista que sale, el modelo empata con la regla", plano(dia[6]["pie_test"])],
         ["más que toda la lista", "aciertos más/mes", plano(dia[6]["particion"]), plano(dia[6]["pie_800"]),
          "incluye bajas y a quien no acepta marketing"]),
        # la vista 7: la regla del piloto, sin la lista de lo que decide María G. (está en la 8). (02/11, W6) El puente
        # del 40,4 y la línea del grupo de control (C3); salen la duración del plan y el tamaño del piloto
        ("v07", None, ["A producción solo si", plano(d12["puente"]), plano(d12["control"]), "mínimo que se distingue",
                       "Grupo de control"],
         ["Lo que decide María G.", "Quién opera la lista después del piloto", "no se distingue de cero",
          "Duración del plan", "clientes contactados"]),
        # (02/11, W6) la vista 8: el flujo de cada mes de C3 (D13.flujo: texto y dueño de cada paso, la alerta en
        # «Medir») y la línea de hitos (D13.hitos: cada hito con su dueño, el rótulo y la llave de go-live). Salen la
        # tabla de lo que decide María G., las fases del Gantt y el dueño genérico «el equipo»
        ("v08", None, [plano(x[c]) for x in d13["flujo"] for c in ("titulo", "texto", "quien")]
         + [plano(x[c]) for x in d13["hitos"] for c in ("hito", "quien")]
         + [plano(d13["rotulo_hitos"]), plano(d13["llave_go_live"]), "sí o no, hasta la lista"],
         ["Lo que decide María G. y en qué semana", "El equipo, en el piloto", "El equipo; el resumen por local",
          "Plan de 20", "lo revisa Sofía R.", "quien elija Casa Óga"]
         + [f["nombre"] for f in PL["fases"] if f["id"] != "piloto"]),
        # la vista 5: de qué lista es el beneficio de la regla (G41); (01/11) el costo con modelo y el presupuesto
        # (02/11, del A7 y del A3) el valor de cada caso (celdas de la diapositiva 8) y la sensibilidad. (02/11, W6)
        # qué mide es D9.mide, con la base de la Parte B (COB-06); los escenarios a un año (COB-07); la sensibilidad,
        # «dentro de su rango» (DAT-02, COB-05); «USD 5,38» dice que es de la Parte B (DAT-03) y el costo, su horizonte
        # (DAT-15)
        ("v05", None, [plano(dia[9]["mide"]), "Costo año 1, con modelo",
                       usd(E["costos"]["con_modelo"]["total_anio_1_usd"]),
                       f"presupuesto {usd(E['costos']['presupuesto_usd'])}", "Por caso:",
                       "Ningún escenario recupera el costo en un año", "Dólares",
                       "por año, en la Parte B", "dólares más el primer año"]
         + [f"{c['celda'].lower()} {c['valor']}" for c in dia[8]["celdas"]],
         ["simulador", "anexo", "lista de 500 sin filtro en validación", "por año, sin filtrar", "dólares de más"]),
        # (01/11) la vista 3: el MVP de la diapositiva 5, al pie. (02/11, W6: UX-06, VIS-05) Sin la tira de cinco
        # pasos: el renglón del producto mínimo con sus hechos, la escala de la cátedra (UX-15, COB-21) y el detalle de
        # la fila Datos (COB-16); los textos de los pasos no se ven
        ("v03", None, ["Producto mínimo"] + [plano(x["valor"]) for x in d5["hechos"]]
         + [plano(x["texto"]) for x in d5["hechos"] if x["texto"]] + [plano(dia[4]["escala"])]
         + [f["detalle"] for f in dia[4]["filas"] if f.get("detalle")],
         [plano(x["texto"]) for x in d5["pasos"]]),
        # (01/11) la vista 6: el plan L1 a L6 con su dueño. (02/11, W6: UX-04, VIS-04, COB-08, ORA-11) Los tres críticos
        # de los 13 en una fila de tres celdas (diapositiva 11): riesgo, señal y umbral, dueño. Sale la línea de las
        # cinco dimensiones; las normas y la escala de la cátedra, en su renglón
        ("v06", None, ids_l + [plano(a["quien"]) for tr in dia[10]["plan"] for a in tr["acciones"]]
         + [f"Riesgos críticos, {fijo(LE['riesgos_criticos'])} de {fijo(LE['riesgos'])}", "Mide:", "Alerta:", "Dueño:"]
         + [plano(x) for c in d11["columnas"] for x in (c["riesgo"], *(f["texto"] for f in c["filas"]))]
         + [plano(dia[10]["nota"])],
         ["en mujeres", "anexo", "cada una:"] + [d["nombre"] for d in LE["dimensiones"]]),
    ]


# ---------------------------------------------------------------- 10. la corrección al Grupo 5 (01/11, W5)

def con_espacio(t):
    """«70%» → «70 %»: la vista 9 pinta así sus textos propios (UX-18, 02/11); las citas del Grupo 5 quedan textuales."""
    return re.sub(r"(\d)%", r"\1 %", t)


def correccion_esperada():
    """(vista, None, textos que tiene que escribir, textos que no puede escribir) de las vistas 9 y 10, desde D3.correccion
    y C3 (diapositivas 14 y 15), con el mismo formato que a_la_vista_esperado(). (02/11, W6) La 9 ya no escribe la cita
    «Dice» (UX-11: va al title, lo mira correccion()) y suma la línea de qué se revisó (COB-20); la 10 escribe la
    versión corta de lo que hacen bien (ORA-14), cuenta las secciones (DAT-05) y no tiene eje ni leyenda al pie
    (UX-17)."""
    D3 = leer_js("datos_e3.js", "D3")
    C3 = leer_js("contenido_e3.js", "C3")
    dia = {d["n"]: d for d in C3["DIAPOSITIVAS"]}
    CO = D3["correccion"]
    T, DOC = CO["total"], CO["documento"]
    ctx = dia[14]["contexto"]
    # las cifras de la línea de contexto (texto de C3) son las de D3: versión, páginas y bloques
    for x in (f"{DOC['version']},", f"{fijo(DOC['paginas'])} págs.", f"{fijo(T['filas'])} bloques"):
        if x not in ctx:
            raise SystemExit(f"C3 diapositiva 14, contexto: no dice «{x}» (D3.correccion)")
    v09 = [f"{fijo(T['revisar'])} de {fijo(T['filas'])}", "Revisar por parte", ctx]
    v09 += [x for c in CO["conteo"] for x in (c["rotulo"], f"{fijo(c['revisar'])} de {fijo(c['filas'])}")]
    for o in CO["top"]:
        lugar = o["parte"] if o["parte"] == "General" else f"{o['parte']} {o['ref']}"
        v09 += [con_espacio(o["titulo_corto"]), f"{lugar} · pág. {o['pagina']}",
                f"Corrección. {con_espacio(o['correccion'])}"]
    TG = CO["target"]
    corto = dia[15]["bien_corto"]
    if [b["seccion"] for b in corto] != [b["seccion"] for b in CO["bien"]]:
        raise SystemExit("C3 diapositiva 15, bien_corto: las secciones no son las de D3.correccion.bien, en su orden")
    secciones = sum(len(re.findall(r"\d+\.\d+", b["seccion"])) for b in CO["bien"])
    v10 = [f"{fijo(T['completo'])} de {fijo(T['filas'])}", "Lo que hacen bien", f"{fijo(secciones)} secciones",
           "Concluimos distinto sobre todo por el target",
           "Por qué concluimos distinto: AUC-ROC en validación con el target de cada grupo",
           "Cruza su umbral en 90 días", "No compra en el doble de su intervalo",
           "Nuestra regla ordena por el atraso frente al umbral", "Su regla también ordena por el atraso",
           f"regla {fijo(TG['nuestro']['regla'], 3)}",
           f"logística {fijo(TG['nuestro']['modelo'], 3)}", f"regla {fijo(TG['suyo']['regla'], 3)}",
           f"modelo {fijo(TG['suyo']['modelo'], 3)}"]
    v10 += [x for b in corto for x in (b["seccion"], b["texto"])]
    # salen: el texto largo de la planilla (sus cifras van al title), el eje y la leyenda del pie, «no por un error»
    v10_no = ["sí o no", "marca sí", "no por un error", "separa todo", "○ regla", "● modelo"]
    v10_no += [b["que"] for b in CO["bien"] if b["que"] not in [c["texto"] for c in corto]]
    return [("v09", None, v09, ["Dice: «"]), ("v10", None, v10, v10_no)]


TERRACOTA = r"""() => {
  const el = document.createElement('i'); el.style.color = 'var(--terra)'; document.querySelector('.e3-vp').appendChild(el)
  const T = getComputedStyle(el).color; el.remove()
  const cuerpo = document.querySelector('.cuerpo')
  const todos = [...cuerpo.querySelectorAll('*')].filter((e) => {
    const cs = getComputedStyle(e); return cs.color === T || cs.fill === T || cs.backgroundColor === T
  })
  // lo que la vista 9 pinta a propósito: la cifra central, el número de cada parte, las celdas en «Revisar» y el
  // número de cada observación (el filete de la tarjeta central es borde, no entra en el filtro)
  const permitidos = todos.filter((e) => e.closest('.e3-v09-central') || e.closest('.e3-v09-n')
    || (e.closest('.e3-v09-conteo svg') && (e.tagName === 'rect' || e.tagName === 'text')))
  const celdas = [...cuerpo.querySelectorAll('.e3-v09-conteo svg rect')].filter((r) => getComputedStyle(r).fill === T).length
  return { total: todos.length, fuera: todos.length - permitidos.length, celdas }
}"""


def correccion(p: Pagina, casos):
    """Los textos de las vistas 9 y 10 (en_pantalla() con sus casos) y dónde va la terracota. (02/11, W6) La cita
    «Dice» de cada observación de la 9 está en el title de su fila y no en pantalla, y los textos propios de la 9
    llevan espacio antes de «%»; cada ítem de lo que hacen bien de la 10 lleva en el title el texto de la planilla."""
    en_pantalla(p, casos)
    D3 = leer_js("datos_e3.js", "D3")
    CO = D3["correccion"]
    revisar = CO["total"]["revisar"]
    p.ir("v01")
    p.ir("v09")
    r = p.pg.evaluate(LEER_VISTA)
    titulos = [norm(t) for t in r["titulos"]]
    for o in CO["top"]:
        cita = norm(f"Dice: «{o['cita']}»")
        if not any(cita in t for t in titulos):
            p.mal(f"v09: la cita de la observación {o['n']} no está en el title de su fila")
    m = re.search(r".{0,30}\d%", r["cuerpo"])
    if m:
        p.mal(f"v09: un porcentaje sin espacio en pantalla: «{m[0]}»")
    r = p.pg.evaluate(TERRACOTA)
    if r["fuera"]:
        p.mal(f"v09: {r['fuera']} elementos en terracota fuera de lo que está en «Revisar»")
    if r["celdas"] != revisar:
        p.mal(f"v09: {r['celdas']} celdas en terracota en el conteo; las secciones en «Revisar» son {revisar}")
    p.ir("v10")
    r = p.pg.evaluate(LEER_VISTA)
    titulos = [norm(t) for t in r["titulos"]]
    for b in CO["bien"]:
        if norm(b["que"]) not in titulos:
            p.mal(f"v10: el texto de la planilla de {b['seccion']} no está en el title de su ítem")
    r = p.pg.evaluate(TERRACOTA)
    if r["total"]:
        p.mal(f"v10: {r['total']} elementos en terracota (la vista no tiene nada en «Revisar»)")


def en_pantalla(p: Pagina, casos):
    for id_, opcion, deben, no_deben in casos:
        # pasar por otra vista: con el mismo hash la vista no se monta de nuevo
        p.ir("v01" if id_ != "v01" else "v02")
        p.ir(id_)
        estado = "al llegar"
        r = p.pg.evaluate(LEER_VISTA)
        # todo en un renglón (una celda partida en dos se lee entera); lo que termina en «\n» se busca al final de un
        # renglón de la pantalla («semana 1» no es «semana 13»), y lo que empieza con «\n», al comienzo
        # sin distinguir mayúsculas: innerText aplica el text-transform de los rótulos (.kpi-lbl)
        plano_ = norm(r["pantalla"]).casefold()
        renglones_ = "\n".join(norm(x) for x in r["pantalla"].split("\n")).casefold() + "\n"
        for x in deben:
            y = norm(x).casefold()
            ok = (y + "\n" in renglones_) if x.endswith("\n") else (y in plano_)
            if not ok:
                p.mal(f"{id_} ({estado}): en pantalla no está «{x.strip()}»")
        for x in no_deben:
            # lo que empieza con «\n» se busca al comienzo de un renglón de la pantalla
            sigue = (("\n" + norm(x).casefold()) in ("\n" + renglones_)) if x.startswith("\n") \
                else (norm(x).casefold() in plano_)
            if sigue:
                p.mal(f"{id_} ({estado}): en pantalla sigue «{x.strip()}»")
        revisar_estado(p, id_, estado, r)


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
    # (02/11) el riel trae las diez vistas y ningún anexo
    riel = p.pg.evaluate("() => [...document.querySelectorAll('.lat-item .lat-n')].map((x) => x.textContent)")
    esperar(riel == [v[1:] for v in VISTAS], f"el riel trae {riel}, se esperaban las diez vistas")
    esperar(not p.pg.locator(".lat-grupo", has_text="Respaldo").count(), "el riel sigue con el grupo «Respaldo»")
    p.pg.locator(".lat-item", has_text="Lo que hacen bien").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#v10", "el riel no lleva a la 10")
    # con el foco en el riel después de un clic, las flechas siguen pasando de vista
    p.tecla("ArrowUp")
    esperar(p.estado()["hash"] == "#v09", "con el foco en el riel, ↑ no vuelve a la anterior")
    # URL: recargar no pierde el lugar; Atrás recorre
    p.pg.reload()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#v09", "recargar pierde la vista")
    p.pg.go_back()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#v10", "Atrás del navegador no vuelve a la vista anterior")
    # notas: N las abre con el guion de C3 y no tapan el tablero
    p.ir("v05")
    p.tecla("n")
    esperar(p.estado()["notas"], "N no abre las notas")
    if p.estado()["notas"]:
        vp = p.pg.locator(".e3-vp").bounding_box()
        notas = p.pg.locator(".e3-notas").bounding_box()
        esperar(vp["y"] + vp["height"] <= notas["y"] + 1, "las notas tapan el tablero")
        txt = p.pg.locator(".e3-notas").inner_text()
        dia5 = {d["n"]: d for d in leer_js("contenido_e3.js", "C3")["DIAPOSITIVAS"]}
        esperar(all(norm(plano(dia5[n]["guion"]))[:30] in norm(txt) for n in (8, 9)),
                "las notas de la 5 no traen el guion de las diapositivas 8 y 9")
        esperar("Francisco C." not in txt, "las notas de la 5 muestran quién habla (ORA-22)")
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
    # (03/11) las preguntas de las vistas 5 y 6 dicen de qué factibilidad hablan
    esperar("Factibilidad económica: ¿se paga?" in notas.inner_text(".e3-notas-ventana"), "la ventana de notas no toma la vista abierta")
    p.tecla("PageDown")
    notas.wait_for_timeout(400)
    esperar("Factibilidad legal: ¿es legal y seguro?" in notas.inner_text(".e3-notas-ventana"), "la ventana de notas no sigue al tablero")
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


# ---------------------------------------------------------------- 9. «Explorar», en ninguna parte (01/11)

def explorar_en_fuentes():
    """Sin navegador: la palabra no aparece en el tablero armado ni en las fuentes de /e3/ (componentes, hojas y el
    texto generado de contenido.py). Lo que una vista mostraba detrás de ese botón quedó a la vista."""
    mal = []
    rutas = [HTML] + sorted(x for x in SRC.rglob("*") if x.is_file() and x.suffix in (".js", ".jsx", ".css", ".html"))
    for f in rutas:
        for i, linea in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if re.search(r"explorar", linea, re.I):
                mal.append(f"«Explorar» en {f.relative_to(APP)}:{i}")
                break
    return mal


def main():
    esperado, guion = contenido_esperado()
    casos_r = a_la_vista_esperado()
    casos_c = correccion_esperada()
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
    problemas: list[str] = anclas_datos() + explorar_en_fuentes()
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        for w, h in RES:
            p = Pagina(nav, w, h, problemas)
            try:
                vistas(p, w, h, out, (w, h) in CAPTURAR and not a.sin_capturas, a.sin_esqueletos)
                contenido(p, esperado)
                en_pantalla(p, casos_r)
                correccion(p, casos_c)
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
