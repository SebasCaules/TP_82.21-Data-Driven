"""
Arma preregistro.json (F0.3). Solo lee train y dev, para el esquema del dataset; no toca test.

Se niega a correr si test-abierto.log existe: después de abrir el test, el preregistro no se rehace.
Un cambio antes de abrir (F3.1) se anota en regla.cambios_antes_de_abrir.

Uso:    python3 -I entregas/entregable-3/_build/D/modelado/armar_preregistro.py
"""
import sys
sys.dont_write_bytecode = True
import csv, gzip, io, json
from pathlib import Path

BUILD = Path(__file__).resolve().parents[2]
if (BUILD / "D" / "modelado" / "test-abierto.log").exists():
    sys.exit("test-abierto.log existe: el test ya se abrió y el preregistro no se rehace")
sys.path.insert(0, str(BUILD / "D" / "modelado"))
import etapa4 as e4  # noqa: E402
import comun, etapa3  # noqa: E402

e3 = json.loads((BUILD / "C/modelado/salida/etapa3.json").read_text(encoding="utf-8"))
eco = json.loads((BUILD / "B/economia/salida/economia.json").read_text(encoding="utf-8"))
cfg = e3["medidos"]["logistica_ajustada"]["config"]
assert cfg == e3["busqueda"]["logistica_sin_genero"]["elegida"]["config"]

buf = io.StringIO()
with gzip.open(comun.DATASET_V02, "rt", encoding="utf-8", newline="") as fh:
    r = csv.reader(fh); cab = next(r); i = cab.index("particion"); w = csv.writer(buf); w.writerow(cab)
    for fila in r:
        if fila[i] in ("train", "dev"):
            w.writerow(fila)
buf.seek(0)
df = comun.cargar(buf)
assert set(df["particion"]) == {"train", "dev"}
esquema = [[c, str(t)] for c, t in df.dtypes.items()]

def h(ruta):
    return {"ruta": ruta, "sha256": e4.sha256_archivo(BUILD / ruta)}

f3 = lambda p: next(f for f in e3["umbral"]["filtradas"][p] if f["umbral"] == "lista de 500 por corte, solo contactables")
mod, reg = f3("modelo"), f3("regla_umbral")
esp = eco["escenarios"]["esperado"]
CAMBIOS = [{
    "fecha": "2026-10-27",
    "version": "1.0 → 1.1",
    "unidad": "F3.1",
    "motivo": "template de la Parte D, sección 8.1 (tabla de métricas y matriz de confusión), con lo que piden "
              "la 8.2 (comparación con el escenario base del ROI de la B 3.4) y la 8.3 (ficha del modelo)",
    "que": "se agrega template_d: cómo se llena cada fila y cada columna de la tabla 8.1 (regla en test, modelo "
           "final en validación y en test, diferencia test − validación), la matriz del modelo final en test, la "
           "comparación con la B 3.4 y los datos de la ficha. Cinco secundarias nuevas: AUC-ROC sobre las filas "
           "contactables, la matriz, el valor neto de la lista de 500 sin filtro, la comparación con la B 3.4 y los "
           "coeficientes del modelo final con la probabilidad del último puesto de la lista. etapa4.py suma el modo "
           "--ensayo, que corre el camino de test con datos que no son de test, y --abrir-test lo corre antes de "
           "registrar la apertura",
    "no_cambia": "candidato, configuración, variables, entrenamiento final, lista de 500 contactables, métrica "
                 "principal, bootstrap y criterio de decisión. Las cifras nuevas son secundarias y no deciden",
    "antes_de_abrir": "sí: armar_preregistro.py se niega a correr si test-abierto.log existe, y no existía"
}]
pre = {
    "version": "1.1",
    "congelado": "2026-10-27",
    "unidad": "F0.3 del plan de cierre del E3 (_build/workforce/PLAN.md); lo usa F3.1",
    "regla": {
        "texto": "«El conjunto de test se mira una sola vez, con el modelo ya elegido» (clase 12, lámina 5; "
                 "wiki/sintesis/criterios-de-la-catedra.md). La A 2.2 lo reservó: «El test no se usa hasta la etapa 4». "
                 "Template de la D, 8.1: «Evaluar una única vez sobre el conjunto de test reservado en la Etapa 1 "
                 "(sección 2.2). No volver a ajustar el modelo ni el umbral después de ver el resultado».",
        "como_se_cumple": "etapa4.py sin bandera solo lee train y dev. Con --abrir-test repite el control en "
                          "validación y el ensayo sin test, exige workforce/contratos/clase13.listo, se niega si "
                          "test-abierto.log ya tiene una línea, escribe la línea y recién después lee test. Lo que "
                          "este archivo fija se cambia, si hace falta, antes de abrir el test (F3.1); después, la "
                          "línea del registro guarda su sha256.",
        "cambios_antes_de_abrir": CAMBIOS
    },
    "entorno": {"scikit_learn": e3["scikit_learn"], "semilla": e3["semilla"]},
    "huellas": {
        "dataset": h("A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz"),
        "comun_py": h("A/modelado/comun.py"),
        "etapa2_py": h("B/modelado/etapa2.py"),
        "etapa3_py": h("C/modelado/etapa3.py"),
        "etapa3_json": h("C/modelado/salida/etapa3.json"),
        "economia_json": h("B/economia/salida/economia.json"),
    },
    "esquema": esquema,
    "particion": {
        "entrenamiento_para_validacion": {
            "particion": "train", "cortes": "2023-01-31 a 2024-04-30 (16)", "filas": 14753,
            "regla": "comun.entrenamiento_para_validacion: sale el embargo de mayo y junio de 2024 (A 2.2)"},
        "validacion": {"particion": "dev", "cortes": ["2024-07-31", "2024-08-31", "2024-09-30"], "filas": 7173},
        "entrenamiento_final": {
            "particion": "train", "cortes": 18, "desde": "2023-01-31", "hasta": "2024-06-30", "filas": 18882,
            "regla": "vuelve el embargo de mayo y junio de 2024 (A 2.2: «vuelven para el modelo final»; "
                     "wiki/entregables/modelado-etapa-3.md, «Para la etapa 4»)",
            "validacion_no_entra": "lo escrito solo devuelve el embargo. Sumar los cortes de validación sería una "
                                   "decisión nueva, y F3.1 (27/10) no la toma: el modelo final se entrena con los 18 "
                                   "cortes de train, como dice la A 2.2"},
        "test": {"particion": "test",
                 "cortes": ["2025-01-31", "2025-02-28", "2025-03-31", "2025-04-30", "2025-05-31"],
                 "filas": 14211, "positivos_publicados_a_2_2": 3602,
                 "nota": "filas y positivos son los que la A 2.2 ya publicó; el script los comprueba al abrir"},
        "fuera": [
            {"particion": "gap", "cortes": ["2024-10-31", "2024-11-30", "2024-12-31"], "filas": 8025,
             "motivo": "separación: su target mira enero a marzo de 2025, meses del test (A 2.2)"},
            {"particion": "test_flag", "cortes": ["2025-06-30", "2025-07-31", "2025-08-31", "2025-09-30"],
             "filas": 11294,
             "motivo": "fuera de la evaluación: su target cae en septiembre a diciembre de 2025, los meses de "
                       "la caída (DC-09, A 2.2). etapa4.py no lo lee en ningún modo"},
            {"particion": "dev", "motivo": "en el modo test no entra al entrenamiento final ni se mide"}]
    },
    "candidato": {
        "nombre": "logistica_ajustada",
        "descripcion": "regresión logística L2 de la etapa 3, ajustada en grilla con 4 pliegues temporales y la "
                       "regla de un error estándar (C 7.1), sin genero (D11, C 5.3)",
        "constructor": "etapa3.logistica (imputación por mediana con marca de vacío y estandarización en "
                       "numéricas; one-hot con agrupación de categorías infrecuentes; lbfgs, hasta 5.000 iteraciones)",
        "config": cfg,
        "config_origen": "etapa3.json → medidos.logistica_ajustada.config, igual a "
                         "busqueda.logistica_sin_genero.elegida.config",
        "hash_config": {"algoritmo": "sha256", "texto": e4.canonico(cfg),
                        "sha256": e4.sha256_texto(e4.canonico(cfg)),
                        "como": "JSON canónico (claves ordenadas, sin espacios, UTF-8) de la configuración tal "
                                "como está en etapa3.json"},
        "variables": etapa3.SIN_GENERO,
        "sin": ["genero"],
        "hash_especificacion": {"algoritmo": "sha256",
                                "sha256": e4.sha256_texto(e4.canonico(e4.especificacion(cfg, etapa3.SIN_GENERO))),
                                "como": "JSON canónico de {constructor, config, variables}"},
    },
    "referencia": {
        "nombre": "regla_umbral",
        "puntaje": "−dias_para_cruzar: primero quien está más cerca de cruzar su umbral",
        "umbral": "θ = max(90, 1,5 × gap_mediano) días (comun.cargar; anexo de fórmulas)",
        "ajuste": "ninguno; no se entrena",
        "practica_actual": "recency_dias, más días sin comprar primero (F07); solo de referencia, no decide"
    },
    "lista": {
        "largo_por_corte": 500,
        "poblacion": "contactables: acepta_marketing y sin pidio_baja al corte (L3)",
        "origen": "umbral elegido en la C 7.2 (H17): lista de 500 por mes armada solo con contactables; 500 es el "
                  "piso de la capacidad de Marketing (C08, envío 29)",
        "empates": "en el borde se reparten en proporción (comun.aciertos_esperados, etapa2.en_lista)",
        "funcion": "etapa2.confusion_lista sobre las filas contactables de cada corte"
    },
    "metrica_principal": {
        "nombre": "precisión de la lista de 500 contactables por corte",
        "definicion": "aciertos (y_churn_90 = 1) sobre lugares de la lista, sumados sobre los cortes del conjunto",
        "se_comparan": ["logistica_ajustada", "regla_umbral"],
        "en_validacion": {"logistica_ajustada": mod["precision"], "regla_umbral": reg["precision"],
                          "registro": "H15 (73,9 %) y H16 (75,8 %)"},
        "origen": "A 2.4 (precisión de la lista mensual de 500) con el filtro de contactables de la C 7.2"
    },
    "secundarias": [
        {"nombre": "recall, F1 y aciertos por mes de la lista de 500 contactables", "origen": "C 7.2; A 2.4"},
        {"nombre": "valor neto anual en USD de la lista de 500 contactables", "origen": "C 7.2 (4.4: VP ARS 99,96 y FP "
         "ARS −47,21, G33; 1.459,42 ARS/USD, G30)", "anualizacion": "12 / cortes del conjunto (× 4 con 3 cortes, G34)"},
        {"nombre": "práctica actual en la lista de 500 contactables", "origen": "C 7.2"},
        {"nombre": "lista de 500 sin filtro: precisión, recall, F1 y precisión por corte", "origen": "C 7.1; A 2.4; H05"},
        {"nombre": "diferencia logística − regla en la lista de 500 sin filtro, con el mismo bootstrap",
         "origen": "C 7.1; H06"},
        {"nombre": "AUC-ROC y AUC-PR", "origen": "A 2.4; H05"},
        {"nombre": "precisión del decil superior y su lift sobre la tasa base", "origen": "A 2.4 y 2.6 (criterio de "
         "éxito 1 del E1)"},
        {"nombre": "umbral de probabilidad 0,5: precisión, recall y F1", "origen": "C 7.2; A 2.4"},
        {"nombre": "calibración: Brier, error por deciles, probabilidad media dentro de la lista", "origen": "C 7.2; H19"},
        {"nombre": "precisión de la lista de 500 por segmento con intervalo de Wilson (formato, canal de alta, "
         "antigüedad, alto valor, genero), con la de la regla al lado", "origen": "C 7.4; H24 a H28; C 6.2, fila 12"},
        {"nombre": "aciertos por mes de la regla en la lista de 500 contactables contra la meta",
         "origen": "criterio de éxito 1 reescrito (B 4.5, G56)"},
        {"nombre": "precisión por corte de la regla en la lista de 500 contactables contra la alerta",
         "origen": "C 6.2, fila 10 (H44)"},
        {"nombre": "AUC-ROC del puntaje sobre todas las filas contactables del conjunto, de la logística, la regla y "
                   "la práctica actual", "origen": "template D 8.1 (F3.1, 27/10)"},
        {"nombre": "matriz de confusión de la lista de 500 contactables (VP, FN, FP, VN), sumada sobre los cortes",
         "origen": "template D 8.1; C 7.2 (F3.1, 27/10)"},
        {"nombre": "valor neto anual en USD de la lista de 500 sin filtro, de la logística y de la regla",
         "origen": "template D 8.2; la lista que usó la B 3.4 (G34) (F3.1, 27/10)"},
        {"nombre": "comparación del valor neto anual con el escenario base del ROI de la B 3.4",
         "origen": "template D 8.2; G40, G41 (F3.1, 27/10)"},
        {"nombre": "coeficientes del modelo final, categorías agrupadas y probabilidad del último puesto de la "
                   "lista de 500 contactables", "origen": "template D 8.3; C 7.3 (H20) (F3.1, 27/10)"}
    ],
    "secundarias_no_deciden": "ninguna secundaria cambia el criterio de decisión; se reportan",
    "referencias": {
        "meta_criterio_1_aciertos_por_mes": 379,
        "meta_criterio_1_origen": "G56: la regla con 500 contactables acierta en promedio 379 por mes en validación",
        "alerta_fila_10_precision": 0.72,
        "alerta_fila_10_origen": "H44: 75,8 % − 3,8 puntos, el medio intervalo del 95 % de una lista de 500"
    },
    "bootstrap": {
        "unidad": "cliente (id_cliente_canonico): se sortean clientes con reposición y se rehace la lista de 500 "
                  "de cada corte",
        "poblacion": "filas contactables del conjunto evaluado",
        "replicas": 1000, "semilla": 42,
        "estadistico": "precisión de la logística ajustada menos precisión de la regla (logística − regla)",
        "intervalo": "95 %, percentiles 2,5 y 97,5 de las réplicas",
        "funcion": "etapa2.bootstrap_diferencia (el método de G17, H06 y H16)",
        "en_validacion": {"ic95": e3["contra"]["filtrada_logistica_ajustada_menos_regla"]["ic95"],
                          "registro": "H16: −3,25 a −1,07 puntos"}
    },
    "criterio_de_decision": {
        "texto_c_6_2_fila_13": "Un modelo reemplaza a la regla solo si suma aciertos por mes con un intervalo que "
                               "excluye el cero y paga lo que agrega al costo (criterio de éxito 1, B 4.5). Se mide "
                               "en el test, en la etapa 4",
        "fila_13": "Modelo · Se reemplaza la regla por la logística sin que le gane. Prob. B, impacto A, Evitar "
                   "(Parte C, 6.2)",
        "texto_b_4_5": "Un modelo reemplaza a la regla solo si suma aciertos por mes con un intervalo que excluye "
                       "el cero y si esos aciertos pagan lo que agrega al costo. En una lista de 500, un punto de "
                       "precisión son 5 aciertos por mes.",
        "operativo": {
            "condicion_1": "el límite inferior del intervalo del 95 % de (logística − regla), en la precisión de "
                           "la lista de 500 contactables por corte, es mayor que 0",
            "condicion_2": "los aciertos extra por mes de la logística en esa lista, (VP logística − VP regla) / "
                           "cortes, llegan a los que pagan el costo incremental",
            "aciertos_para_pagar": {"clave": "meta_criterio_1", "campo": "aciertos_extra_por_mes_para_pagar",
                                    "valor": eco["meta_criterio_1"]["aciertos_extra_por_mes_para_pagar"],
                                    "registro": "G53 y G56: 8.595 por mes para pagar USD 10.400 (G40)"},
            "resultado": "si se cumplen las dos, la logística ajustada reemplaza a la regla; si no, la lista sigue "
                         "con la regla del umbral"
        }
    },
    "template_d": {
        "fuente": "_build/D/template/template-D-texto.txt, sección 8 (8.1 a 8.3)",
        "no_deciden": "todo lo de esta sección es secundario: la decisión es la de criterio_de_decision",
        "tabla_8_1": {
            "columnas": {
                "baseline_test": "regla del umbral (regla_umbral) en test, con la misma lista de 500 contactables "
                                 "por corte. La práctica actual se informa aparte "
                                 "(secundarias.practica_actual_contactables) y no decide",
                "modelo_validacion": "el candidato fijado en la etapa 3 (logística ajustada sin genero) entrenado con "
                                     "el entrenamiento con embargo (16 cortes) y medido en los 3 cortes de validación: "
                                     "la de la C 7.2 (H15)",
                "modelo_test": "el mismo candidato entrenado con los 18 cortes de entrenamiento (vuelve el embargo) y "
                               "medido en los 5 cortes de test",
                "diferencia": "modelo final en test menos modelo final en validación; negativo si cae en test. En "
                              "puntos para las tasas, en unidades para el AUC y en USD por año para el valor neto"
            },
            "filas": {
                "metrica_principal": "precisión de la lista de 500 contactables por corte (metrica_principal)",
                "precision": "la misma cifra que la métrica principal: la principal es la precisión de esta lista",
                "recall": "VP / (VP + FN) de la lista de 500 contactables, sumados sobre los cortes; FN son los "
                          "positivos contactables que quedan fuera de la lista",
                "f1": "2 VP / (2 VP + FP + FN), con la misma matriz",
                "auc_roc": "sklearn.metrics.roc_auc_score(y_churn_90, puntaje) sobre todas las filas contactables "
                           "del conjunto, con los cortes juntos; puntaje: la probabilidad de la logística, "
                           "−dias_para_cruzar para la regla. No es el AUC de la C 7.1 (H05), que es sobre todas las "
                           "filas",
                "valor_neto_usd": "valor neto por año de la lista de 500 contactables: (VP × ARS 99,96 + FP × ARS "
                                  "−47,21) (G33) / 1.459,42 ARS/USD (G30) × 12 / cortes del conjunto (× 4 en "
                                  "validación, × 2,4 en test)"
            },
            "funcion": "etapa2.confusion_lista sobre las filas contactables de cada corte, sumada sobre los cortes; "
                       "los empates del borde se reparten en proporción y la matriz de la regla puede llevar fracciones"
        },
        "matriz_8_1": {
            "modelo": "logistica_ajustada", "conjunto": "test",
            "poblacion": "filas contactables de los 5 cortes de test",
            "celdas": "VP: en la lista y cruza su umbral; FP: en la lista y no cruza; FN: contactable fuera de la "
                      "lista que cruza; VN: contactable fuera de la lista que no cruza. Predicho positivo = en la "
                      "lista de 500 de su corte"
        },
        "comparacion_8_2": {
            "pregunta": "template D 8.2: «¿El valor económico estimado en test sostiene el escenario base del ROI "
                        "(3.4)? Si el resultado cambia el beneficio esperado, actualizar el ROI y registrarlo en la "
                        "sección 11.2»",
            "escenario_base": "«Esperado (base)» de la B 3.4: tasa de éxito 1,02 % (G31), margen ARS 15.282 (G08), "
                              "valores por celda de G33, horizonte 1 año. En test cambian solo las matrices",
            "roi": "ROI = (beneficio anual − costo del año 1) / costo × 100, el de la B 3.4; recupera en el año si el "
                   "beneficio llega al costo",
            "listas": "la B 3.4 usa la lista de 500 sin filtro (G34). La que sale es la de contactables (C 7.2, H17). "
                      "Se informan las dos",
            "filas": [
                {"fila": "modelo_sobre_la_regla", "id": "G40",
                 "que": "modelo sobre la regla, contra el costo incremental",
                 "clave": "economia.json → escenarios.esperado.proyecto",
                 "beneficio_usd": esp["proyecto"]["beneficio_usd"], "costo_usd": esp["proyecto"]["costo_usd"],
                 "roi_pct": esp["proyecto"]["roi_pct"],
                 "en_test": "valor neto anual de la logística menos el de la regla en la misma lista"},
                {"fila": "proyecto_completo", "id": "G40 (beneficio de G34)",
                 "que": "proyecto con modelo frente a no contactar, contra el costo total del año 1",
                 "clave": "economia.json → escenarios.esperado.proyecto_completo",
                 "beneficio_usd": esp["proyecto_completo"]["beneficio_usd"],
                 "costo_usd": esp["proyecto_completo"]["costo_usd"], "roi_pct": esp["proyecto_completo"]["roi_pct"],
                 "en_test": "valor neto anual de la lista de la logística"},
                {"fila": "regla_sin_modelo", "id": "G41",
                 "que": "regla sin modelo con 15 % de descuento, contra el costo del año 1 de la regla",
                 "clave": "economia.json → escenarios.esperado.mvp_con_descuento",
                 "beneficio_usd": esp["mvp_con_descuento"]["beneficio_usd"],
                 "costo_usd": esp["mvp_con_descuento"]["costo_usd"], "roi_pct": esp["mvp_con_descuento"]["roi_pct"],
                 "en_test": "valor neto anual de la lista de la regla"}
            ],
            "contactables_en_validacion": {"id": "H15, H16, H42 (G54)", "logistica_usd": mod["valor_neto_anual_usd"],
                                           "regla_usd": reg["valor_neto_anual_usd"],
                                           "clave": "etapa3.json → umbral.filtradas (lista de 500)"}
        },
        "ficha_8_3": {
            "nombre_y_version": "candidato.nombre, configuración con su hash y versión de este preregistro",
            "algoritmo_e_hiperparametros": "candidato.descripcion, candidato.constructor y config; iteraciones del "
                                           "ajuste final",
            "dataset_y_periodo": "huellas.dataset y particion.entrenamiento_final",
            "features": "las 39 variables de candidato.variables, los términos del modelo (one-hot) y los 15 "
                        "coeficientes de mayor valor absoluto del modelo final (etapa3.coeficientes). La importancia "
                        "por permutación es la de la C 7.3 (H21), medida en validación; no se recalcula en test",
            "umbral": "lista de 500 por corte solo contactables (H17), con la probabilidad del último puesto de cada "
                      "corte de test (etapa3.borde)",
            "desempeno": "tabla_8_1 y matriz_8_1",
            "lo_escribe_la_parte_d": "uso previsto, usos no previstos, limitaciones, reentrenamiento y responsable"
        }
    },
    "salidas": {
        "validacion": "salida/etapa4_validacion.json: cifras de validación, columna «Modelo final (validación)» de la "
                      "8.1 y control contra etapa3.json",
        "ensayo": "salida/etapa4_ensayo.json, con --ensayo y con --abrir-test: el camino de test con datos que no son "
                  "de test; sus cifras no se citan",
        "test": "salida/etapa4.json y una línea en test-abierto.log, solo con --abrir-test"
    }
}
out = BUILD / "D" / "modelado" / "preregistro.json"
out.write_text(json.dumps(pre, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("escrito", out, e4.canonico(cfg), pre["candidato"]["hash_config"]["sha256"])
