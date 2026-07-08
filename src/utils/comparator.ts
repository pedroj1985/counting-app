import type { Comparison } from '../types'

export function compareBLs(manifestBLs: Set<string>, conteoBLs: Set<string>): Comparison {
  const totalBL = manifestBLs.size
  const contados: string[] = []
  const faltantes: string[] = []
  const extranos: string[] = []

  for (const bl of manifestBLs) {
    if (conteoBLs.has(bl)) {
      contados.push(bl)
    } else {
      faltantes.push(bl)
    }
  }

  for (const bl of conteoBLs) {
    if (!manifestBLs.has(bl)) {
      extranos.push(bl)
    }
  }

  const cobertura = totalBL > 0 ? Math.round((contados.length / totalBL) * 1000) / 10 : 0

  return {
    contados: contados.sort(),
    faltantes: faltantes.sort(),
    extranos: extranos.sort(),
    totalBL,
    cobertura,
  }
}
