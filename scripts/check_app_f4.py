"""Check de la unidad APP de la fase 4 de la corrida «presentación final» (canon v1.1).

    python3 /Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final/scripts/check_app_f4.py

Corre, con rutas absolutas y en este orden:

1. pipeline/build_final.py dos veces y git diff --exit-code sobre final/src/datos_final.js: el payload es
   determinista y el versionado es el que sale de los JSON del vault (si una corrida falla, el diff no se corre).
2. npm run build:final y scripts/verificar_final.py.
3. npm run build:e2 y build:e3; el md5 de dist-e3/index.html es el del /e3/ publicado (1903979c…): /final/ no
   tocó /e3/. Después scripts/paridad_e3.py --sin-hoja.
4. git diff --quiet main -- src e2 e3: src/**, e2/** y e3/** sin cambios contra main.
5. docs/formulas.tex compila (pdflatex tres veces, en una carpeta temporal: no pisa docs/formulas.pdf), trae
   «Anexo de fórmulas · v4.0 · 24/11/2026» y tiene 14 secciones en el .tex y en el índice compilado (lo exige
   entregas/_build/consolidados/anexos.py).
6. Lista negra sobre docs/formulas.tex sin los comentarios LaTeX (las notas de cambio van en líneas «%») y con
   «{,}» leído como «,»: las cadenas literales de canon.lista_negra, los patrones de sus cuatro descripciones y lo que
   la tarea mandó sacar («02/11/2026», «solo como piloto»), y el grep de la regla del 23/10.
7. Cifras del anexo contra los JSON: cada par (clave de economia.json o indicador_6_5.json, número del anexo),
   formateado con fijo() de pipeline/build_final.py, tiene que aparecer en el texto del anexo.

Imprime cada paso y cierra con «RESULTADO: OK» o «RESULTADO: FALLA».
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

APP = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final")
VAULT = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD")
CANON = VAULT / ".workforce" / "presentacion-final" / "fase-2" / "canon.json"
if not CANON.exists():   # la carpeta de la corrida se puede limpiar: queda la copia que deja el generador de la A del E4
    CANON = VAULT / "entregas" / "entregable-4" / "_build" / "A" / "registro" / "canon.json"
E3B = VAULT / "entregas" / "entregable-3" / "_build"
TEX = APP / "docs" / "formulas.tex"
MD5_E3 = "1903979ca800a3907a2ae365d30eb48e"
VERSION = "Anexo de fórmulas · v4.0 · 24/11/2026"
SECCIONES = 14
PY = sys.executable

fallas: list[str] = []


def correr(nombre: str, cmd: list[str], cwd: Path = APP, timeout: int = 900) -> subprocess.CompletedProcess | None:
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        fallas.append(f"{nombre}: tardó más de {timeout} s")
        print(f"[FALLA] {nombre}: timeout")
        return None
    ultima = (r.stdout.strip().splitlines() or [""])[-1]
    if r.returncode != 0:
        fallas.append(f"{nombre}: código {r.returncode}")
        print(f"[FALLA] {nombre} (código {r.returncode})")
        print("\n".join((r.stdout + r.stderr).strip().splitlines()[-25:]))
    else:
        print(f"[OK]    {nombre}: {ultima[:110]}")
    return r


def paso(nombre: str, ok: bool, detalle: str = "") -> None:
    print(f"{'[OK]   ' if ok else '[FALLA]'} {nombre}{': ' + detalle if detalle else ''}")
    if not ok:
        fallas.append(nombre + (f": {detalle}" if detalle else ""))


def main() -> int:
    # 1. payload determinista
    r1 = correr("build_final.py (1.ª corrida)", [PY, "-I", str(APP / "pipeline" / "build_final.py")])
    r2 = correr("build_final.py (2.ª corrida)", [PY, "-I", str(APP / "pipeline" / "build_final.py")])
    if r1 is not None and r2 is not None and r1.returncode == 0 and r2.returncode == 0:
        correr("datos_final.js igual al versionado",
               ["git", "-C", str(APP), "diff", "--exit-code", "--", "final/src/datos_final.js"])
    else:
        paso("datos_final.js igual al versionado", False, "no se compara: build_final.py falló")

    # 2. /final/
    correr("npm run build:final", ["npm", "--prefix", str(APP), "run", "build:final"])
    correr("verificar_final.py", [PY, "-I", str(APP / "scripts" / "verificar_final.py"), "--sin-capturas"],
           timeout=1800)

    # 3. /e3/ intacto
    correr("npm run build:e2", ["npm", "--prefix", str(APP), "run", "build:e2"])
    correr("npm run build:e3", ["npm", "--prefix", str(APP), "run", "build:e3"])
    html = APP / "dist-e3" / "index.html"
    md5 = hashlib.md5(html.read_bytes()).hexdigest() if html.exists() else "sin archivo"
    paso("md5 de dist-e3/index.html", md5 == MD5_E3, md5)
    correr("paridad_e3.py --sin-hoja", [PY, "-I", str(APP / "scripts" / "paridad_e3.py"), "--sin-hoja"], timeout=1800)

    # 4. src, e2 y e3 sin cambios contra main
    correr("src/**, e2/** y e3/** iguales a main",
           ["git", "-C", str(APP), "diff", "--quiet", "main", "--", "src", "e2", "e3"])

    # 5. anexo de fórmulas
    tex = TEX.read_text(encoding="utf-8")
    paso("versión del anexo", VERSION in tex, VERSION)
    n_tex = len(re.findall(r"^\\section\{", tex, re.M))
    paso("secciones en formulas.tex", n_tex == SECCIONES, f"{n_tex} de {SECCIONES}")
    if not shutil.which("pdflatex"):
        paso("pdflatex", False, "no está en el PATH")
    else:
        with tempfile.TemporaryDirectory() as tmp:
            ok = True
            for i in range(3):
                r = subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error",
                                    f"-output-directory={tmp}", str(TEX)], cwd=TEX.parent,
                                   capture_output=True, text=True, timeout=300)
                ok = ok and r.returncode == 0
            pdf = Path(tmp) / "formulas.pdf"
            aux = Path(tmp) / "formulas.toc"
            n_toc = len(re.findall(r"\\contentsline \{section\}", aux.read_text(encoding="latin-1"))) if aux.exists() else -1
            paso("formulas.tex compila", ok and pdf.exists(), f"{pdf.stat().st_size // 1024} KB" if pdf.exists() else "sin PDF")
            if aux.exists():
                paso("secciones en el índice compilado", n_toc == SECCIONES, f"{n_toc} de {SECCIONES}")
            else:
                aux = Path(tmp) / "formulas.aux"
                n_aux = len(re.findall(r"\\contentsline \{section\}", aux.read_text(encoding="latin-1"))) \
                    if aux.exists() else -1
                paso("secciones en el .aux compilado", n_aux == SECCIONES, f"{n_aux} de {SECCIONES}")

    # 6. lista negra del canon fuera de las notas de cambio
    lista = json.loads(CANON.read_text(encoding="utf-8"))["lista_negra"]
    plano = "\n".join(l for l in tex.splitlines() if not l.lstrip().startswith("%")).replace("{,}", ",")
    plano_1 = re.sub(r"\s+", " ", plano)
    descripciones = {   # cadenas del canon que describen un uso, no un texto literal
        "12,41 o 9,92 como umbral que decide": None,
        "diciembre de 2026 como mes de la primera lista": r"diciembre de 2026",
        "equipo consultor como operador del piloto": r"equipo consultor",
        "semana 13 como elección del operador": r"semana 13\b",
    }
    literales = [c for c in lista["cadenas"] if c not in descripciones] + ["02/11/2026", "solo como piloto"]
    hits = [c for c in literales if c in plano_1]
    hits += [d for d, rx in descripciones.items() if rx and re.search(rx, plano_1, re.I)]
    # 12,41 y 9,92 solo como referencia: cada línea que los trae dice «ref»
    hits += [f"12,41 o 9,92 sin «ref» (línea {i})" for i, l in enumerate(plano.splitlines(), 1)
             if re.search(r"\b(12,41|9,92)\b", l) and "ref" not in l]
    # «umbral de producción» solo en la nota que dice que se reemplaza
    n_up = len(re.findall(r"umbral de producción", plano_1, re.I))
    n_nota = len(re.findall(r"Reemplaza al ``umbral de producción", plano_1))
    if n_up != n_nota:
        hits.append(f"umbral de producción fuera de la nota de reemplazo ({n_up - n_nota})")
    paso("lista negra del canon en formulas.tex", not hits,
         "; ".join(hits) if hits else f"0 de {len(literales)} cadenas, {len(descripciones)} descripciones y las referencias")
    rx_23_10 = r"pendiente|abierto|a definir|sin respuesta|espera respuesta"
    h2310 = sorted(set(m.group(0).lower() for m in re.finditer(rx_23_10, plano_1, re.I)))
    paso("regla del 23/10 en formulas.tex", not h2310, ", ".join(h2310) if h2310 else "0 apariciones")

    # 7. cifras del anexo contra los JSON
    sys.path.insert(0, str(APP / "pipeline"))
    from build_final import fijo  # noqa: E402
    eco = json.loads((E3B / "B" / "economia" / "salida" / "economia.json").read_text(encoding="utf-8"))
    ind = json.loads((E3B / "C" / "modelado" / "salida" / "indicador_6_5.json").read_text(encoding="utf-8"))

    def k(d, ruta):
        for p in ruta.split("."):
            d = d[int(p)] if isinstance(d, list) else d[p]
        return d

    def fe(iso, anio=True):
        a, m, d = iso.split("-")
        return f"{d}/{m}/{a}" if anio else f"{d}/{m}"

    up = "umbral_de_pase.por_variante."
    pares = [(f"economia.{r}", fijo(abs(k(eco, r)) * x, dec)) for r, dec, x in (
        ("piloto_minimo.total_usd", 0, 1), ("piloto_minimo.unicos_usd", 0, 1),
        ("operacion_minima.inversion_usd", 0, 1), ("operacion_minima.recurrente_usd_anual", 0, 1),
        ("operacion_minima.primer_anio_usd", 0, 1), ("produccion_completa.inversion_usd", 0, 1),
        ("produccion_completa.recurrente_usd_anual", 0, 1), ("produccion_completa.primer_anio_usd", 0, 1),
        ("comprobacion_g39.anio_1_usd", 0, 1), ("comprobacion_g39.unicos_usd", 0, 1),
        ("piloto_minimo.acciones_marketing_ars", 0, 1),
        ("piloto.ramas.con_descuento.costo_por_contactado_ars", 2, 1),
        ("piloto.ramas.alto_valor.costo_por_contactado_ars", 2, 1),
        ("piloto.metrica_decision.mde.por_rama", 2, 1), ("piloto.metrica_decision.p0_cruce_90d_control", 2, 100),
        ("piloto.metrica_decision.mde_con_el_control_en_p0.por_rama_contra_control_pp", 2, 1),
        ("piloto.metrica_decision.mde_con_el_control_en_p0.ramas_juntas_contra_control_pp", 2, 1),
        ("piloto.metrica_decision.mde_con_el_control_en_p0.por_rama_con_80_de_control_pp", 2, 1),
        (up + "operacion_minima.primer_anio_con_la_inversion_que_queda.con_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "operacion_minima.primer_anio_con_la_inversion_que_queda.sin_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "operacion_minima.primer_anio_con_la_inversion_que_queda.con_descuento.s_equilibrio", 2, 100),
        (up + "operacion_minima.primer_anio_con_la_inversion_que_queda.sin_descuento.s_equilibrio", 2, 100),
        (up + "operacion_minima.solo_recurrente.con_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "operacion_minima.solo_recurrente.sin_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "operacion_minima.tres_anios_por_anio.con_descuento.costo_anual_usd", 0, 1),
        (up + "operacion_minima.tres_anios_por_anio.con_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "operacion_minima.tres_anios_por_anio.sin_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "produccion_completa.primer_anio_con_la_inversion_que_queda.con_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "produccion_completa.primer_anio_con_la_inversion_que_queda.sin_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "produccion_completa.solo_recurrente.con_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "produccion_completa.solo_recurrente.sin_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "produccion_completa.tres_anios_por_anio.con_descuento.costo_anual_usd", 2, 1),
        (up + "produccion_completa.tres_anios_por_anio.con_descuento.diferencia_cruce_90d_pp", 2, 1),
        (up + "produccion_completa.tres_anios_por_anio.sin_descuento.diferencia_cruce_90d_pp", 2, 1),
        ("sensibilidad_umbral_de_pase.sin_costo_adicional.con_descuento_pp", 2, 1),
        ("sensibilidad_umbral_de_pase.sin_costo_adicional.sin_descuento_pp", 2, 1),
        ("sensibilidad_umbral_de_pase.limpieza_dentro_del_piloto.piloto_usd", 0, 1),
        ("umbral_de_pase.esperado_con_la_tasa_observada_pp", 2, 1),
        ("potencia_piloto.mde_por_rama_pp", 2, 1), ("potencia_piloto.mde_ramas_juntas_pp", 2, 1),
        ("potencia_piloto.potencia_rama_sin_descuento_en_su_umbral", 0, 100),
        ("potencia_piloto.potencia_rama_con_descuento_en_su_umbral", 0, 100),
        ("potencia_piloto.potencia_ramas_juntas_en_el_umbral_sin_descuento", 0, 100),
        ("potencia_piloto.clientes_por_grupo_para_ver_lo_esperado", 0, 1),
        ("potencia_piloto.fuera_del_20_por_mes", 0, 1),
        ("valor_informacion.medicion_sola_usd", 2, 1), ("valor_informacion.resto_usd", 2, 1),
        ("valor_informacion.piloto_sobre_operacion_minima", 1, 100),
        ("valor_informacion.piloto_sobre_produccion_completa", 1, 100),
        ("rango_anual.trimestre_x4_usd.0", 2, 1), ("rango_anual.trimestre_x4_usd.1", 2, 1),
        ("rango_anual.doce_meses_usd.0", 2, 1), ("rango_anual.doce_meses_usd.1", 2, 1),
        ("rango_anual.incremental_trimestre_x4_usd.0", 2, 1), ("rango_anual.incremental_trimestre_x4_usd.1", 2, 1),
        ("rango_anual.roi_pct.0", 2, 1), ("rango_anual.roi_pct.1", 2, 1),
        ("rango_anual.lista_tal_cual_usd.0", 2, 1), ("rango_anual.lista_tal_cual_usd.1", 2, 1),
        ("rango_anual.lista_tal_cual_roi_pct.0", 2, 1), ("rango_anual.lista_tal_cual_roi_pct.1", 2, 1),
    )]
    cal = eco["piloto"]["calendario"]
    pares += [("economia.piloto.calendario.semana_1", fe(cal["semana_1"])),
              ("economia.piloto.calendario.semana_1_hasta", fe(cal["semana_1_hasta"])),
              ("economia.piloto.calendario.primera_lista.lunes", fe(cal["primera_lista"]["lunes"], False)),
              ("economia.piloto.calendario.primera_lista.hasta", fe(cal["primera_lista"]["hasta"])),
              ("economia.piloto.calendario.primera_lista.corte", fe(cal["primera_lista"]["corte"])),
              ("economia.piloto.calendario.primera_lista_cierre_90d.fecha", fe(cal["primera_lista_cierre_90d"]["fecha"])),
              ("economia.piloto.calendario.tercera_lista.lunes", fe(cal["tercera_lista"]["lunes"])),
              ("economia.piloto.calendario.tercera_lista.corte", fe(cal["tercera_lista"]["corte"])),
              ("economia.piloto.calendario.tercera_lista.cierre_90d", fe(cal["tercera_lista"]["cierre_90d"])),
              ("economia.piloto.calendario.preliminar.lunes", fe(cal["preliminar"]["lunes"])),
              ("economia.piloto.calendario.final.lunes", fe(cal["final"]["lunes"]))]
    pares += [(f"indicador_6_5.{r}", fijo(k(ind, r) * x, dec)) for r, dec, x in (
        ("fraccion_de_los_contactables", 1, 100), ("contactables_validacion", 0, 1),
        ("referencia.diferencia_min_pp", 1, 1), ("referencia.diferencia_max_pp", 1, 1))]
    faltan = [f"{c} = {v}" for c, v in pares if v not in plano_1]
    paso("cifras del anexo contra economia.json e indicador_6_5.json", not faltan,
         "; ".join(faltan) if faltan else f"{len(pares)} de {len(pares)} pares")

    print()
    if fallas:
        print(f"{len(fallas)} fallas: " + "; ".join(fallas))
        print("RESULTADO: FALLA")
        return 1
    print("RESULTADO: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
