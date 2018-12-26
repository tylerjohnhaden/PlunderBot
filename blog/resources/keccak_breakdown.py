import numpy as np

"""
https://keccak.team/keccak_specs_summary.html


"""

"""
RC[0] 0x0000000000000001 RC[12] 0x000000008000808B
RC[1] 0x0000000000008082 RC[13] 0x800000000000008B
RC[2] 0x800000000000808A RC[14] 0x8000000000008089
RC[3] 0x8000000080008000 RC[15] 0x8000000000008003
RC[4] 0x000000000000808B RC[16] 0x8000000000008002
RC[5] 0x0000000080000001 RC[17] 0x8000000000000080
RC[6] 0x8000000080008081 RC[18] 0x000000000000800A
RC[7] 0x8000000000008009 RC[19] 0x800000008000000A
RC[8] 0x000000000000008A RC[20] 0x8000000080008081
RC[9] 0x0000000000000088 RC[21] 0x8000000000008080
RC[10] 0x0000000080008009 RC[22] 0x0000000080000001
RC[11] 0x000000008000000A RC[23] 0x8000000080008008
"""

RC = [
    0x0000000000000001,
    0x0000000000008082,
    0x800000000000808A,
    0x8000000080008000,
    0x000000000000808B,
    0x0000000080000001,
    0x8000000080008081,
    0x8000000000008009,
    0x000000000000008A,
    0x0000000000000088,
    0x0000000080008009,
    0x000000008000000A,
    0x000000008000808B,
    0x800000000000008B,
    0x8000000000008089,
    0x8000000000008003,
    0x8000000000008002,
    0x8000000000000080,
    0x000000000000800A,
    0x800000008000000A,
    0x8000000080008081,
    0x8000000000008080,
    0x0000000080000001,
    0x8000000080008008
]

thingy = [0, 0, 0, 0, 0, 0, 0, 0]
for rc in RC:
    thingy[sum(map(int, str(bin(rc))[2:]))] += 1
    print(str(bin(rc))[2:].rjust(64, '0').replace('0', '`').replace('1', '*'), '...', rc, '...',
          thingy)

"""
r[x,y]=
      x = 3 x = 4 x = 0 x = 1 x = 2
y = 2    25    39     3    10    43
y = 1    55    20    36    44     6
y = 0    28    27     0     1    62
y = 4    56    14    18     2    61
y = 3    21    8     41    45    15     
"""

r = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14],
]


def rot(W, r):
    return 0


def Round(b):
    """Sudo-code for Round

    Round[b](A,RC) {
        # θ step
        C[x] = A[x,0] xor A[x,1] xor A[x,2] xor A[x,3] xor A[x,4],   for x in 0…4
        D[x] = C[x-1] xor rot(C[x+1],1),                             for x in 0…4
        A[x,y] = A[x,y] xor D[x],                           for (x,y) in (0…4,0…4)

        # ρ and π steps
        B[y,2*x+3*y] = rot(A[x,y], r[x,y]),                 for (x,y) in (0…4,0…4)

        # χ step
        A[x,y] = B[x,y] xor ((not B[x+1,y]) and B[x+2,y]),  for (x,y) in (0…4,0…4)

        # ι step
        A[0,0] = A[0,0] xor RC

        return A
    }"""

    def _round(A, RC):
        # θ step
        C = list(map((lambda x: A[x][0] ^ A[x][1] ^ A[x][2] ^ A[x][3] ^ A[x][4]), range(5)))
        D = list(map((lambda x: C[x - 1] ^ rot(C[x + 1], 1)), range(5)))
        A = list(map((lambda x: list(map((lambda y: A[x][y] ^ D[x]), range(5)))), range(5)))

        # ρ and π steps
        # TODO: B[y,2*x+3*y] = rot(A[x,y], r[x,y]),                 for (x,y) in (0…4,0…4)
        B = [[0]]

        # χ step
        A = list(map((lambda x: list(map((lambda y: B[x][y] ^ (~B[x + 1][y] & B[x + 2][y])), range(5)))), range(5)))

        # ι step
        A[0][0] = A[0][0] ^ RC

    return _round


def n(b):
    """The number of rounds n depends on the permutation width,
        and is given by (n = 12 + (2 * l)), where ((2 ** l) = w) and (b = 25 * w).
        This gives 24 rounds for Keccak-f[1600]."""

    _n = 12 + (2 * np.log2(b / 25))
    assert _n == int(_n)
    return int(_n)


def Keccak_f(b):
    """Sudo-code for Keccak-f

    Keccak-f[b](A) {
      for i in 0…n-1
        A = Round[b](A, RC[i])
      return A
    }"""

    def _keccak_f(A):
        for i in range(n(b)):
            A = Round(b)(A, RC[i])
        return A

    return _keccak_f


def Keccak():
    """Sudo-code for Keccak

    Keccak[r,c](Mbytes || Mbits) {
        # Padding
        d = 2^|Mbits| + sum for i=0..|Mbits|-1 of 2^i*Mbits[i]
        P = Mbytes || d || 0x00 || … || 0x00
        P = P xor (0x00 || … || 0x00 || 0x80)

        # Initialization
        S[x,y] = 0,                               for (x,y) in (0…4,0…4)

        # Absorbing phase
        for each block Pi in P
        S[x,y] = S[x,y] xor Pi[x+5*y],          for (x,y) such that x+5*y < r/w
        S = Keccak-f[r+c](S)

        # Squeezing phase
        Z = empty string
        while output is requested
        Z = Z || S[x,y],                        for (x,y) such that x+5*y < r/w
        S = Keccak-f[r+c](S)

        return Z
    }"""

    pass
