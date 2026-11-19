"""Codificador QR propio, sin dependencias (19/11, fase 11 de la auditoría de dataviz, spec 2.2). Lo usa
pipeline/informe_paginas.py para dejar en final/src/informe.js la matriz del QR que lleva al informe: el tablero la
dibuja en SVG (V16), sin red ni imagen externa.

    from qr import matriz
    filas = matriz("https://…", nivel="M")   # lista de cadenas de '0' y '1', una por fila, sin el margen blanco

Modo byte (UTF-8), versiones 1 a 10, niveles L, M, Q y H (ISO/IEC 18004). Elige la versión más chica en la que entra el
texto y la máscara de menor penalización (las cuatro reglas de la norma). El margen blanco de cuatro módulos lo pone
quien dibuja.

    python3 -I pipeline/qr.py "texto" [--nivel M]   # imprime la matriz con «##» y «  »
"""
from __future__ import annotations

import argparse

# ---------------------------------------------------------------- tablas de la norma (versiones 1 a 10)
# Por versión y nivel: (código de corrección por bloque, [(bloques, datos por bloque), …]).
BLOQUES = {
    1: {"L": (7, [(1, 19)]), "M": (10, [(1, 16)]), "Q": (13, [(1, 13)]), "H": (17, [(1, 9)])},
    2: {"L": (10, [(1, 34)]), "M": (16, [(1, 28)]), "Q": (22, [(1, 22)]), "H": (28, [(1, 16)])},
    3: {"L": (15, [(1, 55)]), "M": (26, [(1, 44)]), "Q": (18, [(2, 17)]), "H": (22, [(2, 13)])},
    4: {"L": (20, [(1, 80)]), "M": (18, [(2, 32)]), "Q": (26, [(2, 24)]), "H": (16, [(4, 9)])},
    5: {"L": (26, [(1, 108)]), "M": (24, [(2, 43)]), "Q": (18, [(2, 15), (2, 16)]), "H": (22, [(2, 11), (2, 12)])},
    6: {"L": (18, [(2, 68)]), "M": (16, [(4, 27)]), "Q": (24, [(4, 19)]), "H": (28, [(4, 15)])},
    7: {"L": (20, [(2, 78)]), "M": (18, [(4, 31)]), "Q": (18, [(2, 14), (4, 15)]), "H": (26, [(4, 13), (1, 14)])},
    8: {"L": (24, [(2, 97)]), "M": (22, [(2, 38), (2, 39)]), "Q": (22, [(4, 18), (2, 19)]), "H": (26, [(4, 14), (2, 15)])},
    9: {"L": (30, [(2, 116)]), "M": (22, [(3, 36), (2, 37)]), "Q": (20, [(4, 16), (4, 17)]), "H": (24, [(4, 12), (4, 13)])},
    10: {"L": (18, [(2, 68), (2, 69)]), "M": (26, [(4, 43), (1, 44)]), "Q": (24, [(6, 19), (2, 20)]),
         "H": (28, [(6, 15), (2, 16)])},
}
ALINEACION = {1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42],
              9: [6, 26, 46], 10: [6, 28, 50]}
NIVEL_BITS = {"L": 0b01, "M": 0b00, "Q": 0b11, "H": 0b10}
# Los restos de bits al final de la colocación (versiones 2 a 6: 7; 7 a 10: 0).
RESTO = {1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 0, 8: 0, 9: 0, 10: 0}

# ---------------------------------------------------------------- GF(256) y Reed-Solomon
EXP = [0] * 512
LOG = [0] * 256
_x = 1
for _i in range(255):
    EXP[_i] = _x
    LOG[_x] = _i
    _x <<= 1
    if _x & 0x100:
        _x ^= 0x11D
for _i in range(255, 512):
    EXP[_i] = EXP[_i - 255]


def _mul(a: int, b: int) -> int:
    return 0 if a == 0 or b == 0 else EXP[LOG[a] + LOG[b]]


def _generador(n: int) -> list[int]:
    """Polinomio generador de grado n, coeficientes de mayor a menor grado (el primero es 1)."""
    g = [1]
    for i in range(n):
        g2 = [0] * (len(g) + 1)
        for j, c in enumerate(g):
            g2[j] ^= c
            g2[j + 1] ^= _mul(c, EXP[i])
        g = g2
    return g


def _correccion(datos: list[int], n: int) -> list[int]:
    """Los n códigos de corrección de un bloque: el resto de datos·x^n dividido por el generador."""
    g = _generador(n)
    r = list(datos) + [0] * n
    for i in range(len(datos)):
        c = r[i]
        if c:
            for j in range(1, len(g)):
                r[i + j] ^= _mul(g[j], c)
    return r[len(datos):]


# ---------------------------------------------------------------- datos
def _capacidad(version: int, nivel: str) -> int:
    return sum(b * d for b, d in BLOQUES[version][nivel][1])


def _codigos_datos(texto: bytes, version: int, nivel: str) -> list[int]:
    bits: list[int] = []

    def poner(valor: int, largo: int):
        bits.extend((valor >> (largo - 1 - i)) & 1 for i in range(largo))

    poner(0b0100, 4)                                   # modo byte
    poner(len(texto), 8 if version <= 9 else 16)       # cuenta de caracteres
    for b in texto:
        poner(b, 8)
    total = _capacidad(version, nivel) * 8
    poner(0, min(4, total - len(bits)))                # terminador
    while len(bits) % 8:
        bits.append(0)
    cods = [int("".join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
    relleno = [0xEC, 0x11]
    k = 0
    while len(cods) < total // 8:
        cods.append(relleno[k % 2])
        k += 1
    return cods


def _intercalar(datos: list[int], version: int, nivel: str) -> list[int]:
    n_ec, grupos = BLOQUES[version][nivel]
    bloques = []
    i = 0
    for cuantos, largo in grupos:
        for _ in range(cuantos):
            bloques.append(datos[i:i + largo])
            i += largo
    ecs = [_correccion(b, n_ec) for b in bloques]
    out = []
    for k in range(max(len(b) for b in bloques)):
        out += [b[k] for b in bloques if k < len(b)]
    for k in range(n_ec):
        out += [e[k] for e in ecs]
    return out


# ---------------------------------------------------------------- matriz
def _bch(valor: int, generador: int, grado: int) -> int:
    r = valor << grado
    largo_g = generador.bit_length()
    while r.bit_length() >= largo_g:
        r ^= generador << (r.bit_length() - largo_g)
    return r


def _formato(nivel: str, mascara: int) -> int:
    v = (NIVEL_BITS[nivel] << 3) | mascara
    return ((v << 10) | _bch(v, 0b10100110111, 10)) ^ 0b101010000010010


def _info_version(version: int) -> int:
    return (version << 12) | _bch(version, 0b1111100100101, 12)


MASCARAS = [
    lambda f, c: (f + c) % 2 == 0,
    lambda f, c: f % 2 == 0,
    lambda f, c: c % 3 == 0,
    lambda f, c: (f + c) % 3 == 0,
    lambda f, c: (f // 2 + c // 3) % 2 == 0,
    lambda f, c: (f * c) % 2 + (f * c) % 3 == 0,
    lambda f, c: ((f * c) % 2 + (f * c) % 3) % 2 == 0,
    lambda f, c: ((f + c) % 2 + (f * c) % 3) % 2 == 0,
]


def _base(version: int):
    """La matriz con los patrones fijos (buscadores, separadores, temporización, alineación, módulo oscuro) y la marca
    de qué celdas están reservadas (incluidas las de formato y versión, que se escriben después)."""
    n = 17 + 4 * version
    m = [[0] * n for _ in range(n)]
    fijo = [[False] * n for _ in range(n)]

    def poner(f, c, v):
        m[f][c] = v
        fijo[f][c] = True

    for f0, c0 in ((0, 0), (0, n - 7), (n - 7, 0)):
        for df in range(-1, 8):
            for dc in range(-1, 8):
                f, c = f0 + df, c0 + dc
                if not (0 <= f < n and 0 <= c < n):
                    continue
                anillo = max(abs(df - 3), abs(dc - 3))
                poner(f, c, 1 if anillo in (0, 1, 3) else 0)
    for i in range(8, n - 8):
        poner(6, i, 1 if i % 2 == 0 else 0)
        poner(i, 6, 1 if i % 2 == 0 else 0)
    pos = ALINEACION[version]
    k = len(pos)
    for a, fc in enumerate(pos):
        for b, cc in enumerate(pos):
            if (a, b) in ((0, 0), (0, k - 1), (k - 1, 0)):
                continue                                # las tres esquinas se pisarían con un buscador
            for df in range(-2, 3):
                for dc in range(-2, 3):
                    poner(fc + df, cc + dc, 1 if max(abs(df), abs(dc)) != 1 else 0)
    for i in range(9):                                  # formato (se escribe después), salvo la temporización
        if not fijo[8][i]:
            poner(8, i, 0)
        if not fijo[i][8]:
            poner(i, 8, 0)
    for i in range(8):
        poner(8, n - 1 - i, 0)
    for i in range(7):
        poner(n - 1 - i, 8, 0)
    poner(n - 8, 8, 1)                                  # módulo oscuro
    if version >= 7:
        for i in range(6):
            for j in range(3):
                poner(i, n - 11 + j, 0)
                poner(n - 11 + j, i, 0)
    return m, fijo


def _colocar(m, fijo, cods: list[int], version: int):
    n = len(m)
    bits = [(c >> (7 - i)) & 1 for c in cods for i in range(8)] + [0] * RESTO[version]
    k = 0
    c = n - 1
    sube = True
    while c > 0:
        if c == 6:
            c -= 1
        filas = range(n - 1, -1, -1) if sube else range(n)
        for f in filas:
            for cc in (c, c - 1):
                if not fijo[f][cc]:
                    m[f][cc] = bits[k] if k < len(bits) else 0
                    k += 1
        sube = not sube
        c -= 2


def _escribir_formato(m, nivel: str, mascara: int, version: int):
    """Las dos copias de los 15 bits de formato (b[0] es el menos significativo) y, desde la versión 7, las dos de la
    información de versión. m[fila][columna]."""
    n = len(m)
    fmt = _formato(nivel, mascara)
    b = [(fmt >> i) & 1 for i in range(15)]
    # copia 1, alrededor del buscador de arriba a la izquierda (la fila 6 y la columna 6 son de temporización)
    for i in range(6):
        m[i][8] = b[i]
    m[7][8] = b[6]
    m[8][8] = b[7]
    m[8][7] = b[8]
    for i in range(9, 15):
        m[8][14 - i] = b[i]
    # copia 2: arriba a la derecha (fila 8, bits 0 a 7) y abajo a la izquierda (columna 8, bits 8 a 14)
    for i in range(8):
        m[8][n - 1 - i] = b[i]
    for i in range(8, 15):
        m[n - 15 + i][8] = b[i]
    if version >= 7:
        vi = _info_version(version)
        for i in range(18):
            bit = (vi >> i) & 1
            f, cc = i // 3, n - 11 + i % 3
            m[f][cc] = bit
            m[cc][f] = bit


def _penalizacion(m) -> int:
    n = len(m)
    p = 0
    # regla 1: corridas de 5 o más del mismo color, en filas y columnas
    for linea in list(m) + [list(col) for col in zip(*m)]:
        corrida = 1
        for i in range(1, n):
            if linea[i] == linea[i - 1]:
                corrida += 1
            else:
                if corrida >= 5:
                    p += 3 + corrida - 5
                corrida = 1
        if corrida >= 5:
            p += 3 + corrida - 5
    # regla 2: cuadros de 2 × 2 del mismo color
    for f in range(n - 1):
        for c in range(n - 1):
            v = m[f][c]
            if v == m[f][c + 1] == m[f + 1][c] == m[f + 1][c + 1]:
                p += 3
    # regla 3: el patrón 1:1:3:1:1 con cuatro claros a un lado
    pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]
    pat2 = pat1[::-1]
    for linea in list(m) + [list(col) for col in zip(*m)]:
        for i in range(n - 10):
            tramo = linea[i:i + 11]
            if tramo == pat1 or tramo == pat2:
                p += 40
    # regla 4: proporción de oscuros
    oscuros = sum(map(sum, m))
    k = abs(oscuros * 100 // (n * n) - 50) // 5
    p += 10 * k
    return p


def matriz(texto: str, nivel: str = "M") -> list[str]:
    """La matriz del QR de `texto` (modo byte, UTF-8) con nivel de corrección `nivel`, sin margen: una cadena de '0' y
    '1' por fila. Corta si el texto no entra en la versión 10."""
    nivel = nivel.upper()
    if nivel not in NIVEL_BITS:
        raise ValueError(f"nivel «{nivel}»: L, M, Q o H")
    datos = texto.encode("utf-8")
    version = next((v for v in BLOQUES if 4 + (8 if v <= 9 else 16) + 8 * len(datos) <= _capacidad(v, nivel) * 8), None)
    if version is None:
        raise ValueError(f"el texto ({len(datos)} bytes) no entra en un QR de versión 10, nivel {nivel}")
    cods = _intercalar(_codigos_datos(datos, version, nivel), version, nivel)
    mejor = None
    for k, mk in enumerate(MASCARAS):
        m, fijo = _base(version)
        _colocar(m, fijo, cods, version)
        n = len(m)
        for f in range(n):
            for c in range(n):
                if not fijo[f][c] and mk(f, c):
                    m[f][c] ^= 1
        _escribir_formato(m, nivel, k, version)
        p = _penalizacion(m)
        if mejor is None or p < mejor[0]:
            mejor = (p, m)
    return ["".join(str(x) for x in fila) for fila in mejor[1]]


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("texto")
    ap.add_argument("--nivel", default="M")
    a = ap.parse_args()
    filas = matriz(a.texto, a.nivel)
    blanco = "  " * (len(filas) + 8)
    print("\n".join([blanco] * 4 + ["  " * 4 + f.replace("1", "##").replace("0", "  ") + "  " * 4 for f in filas]
                    + [blanco] * 4))
    print(f"{len(filas)} × {len(filas)} módulos (versión {(len(filas) - 17) // 4}, nivel {a.nivel.upper()})")


if __name__ == "__main__":
    main()
