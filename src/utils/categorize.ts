import { Category } from '@/types'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const KEYWORDS: [Category, string[]][] = [
  ['alimentation', ['course', 'supermarche', 'marche', 'epicerie', 'nourriture', 'alimentation']],
  ['transport', ['essence', 'carburant', 'gasoil', 'taxi', 'bus', 'moto', 'uber', 'transport', 'peage']],
  ['restaurant', ['resto', 'restaurant', 'maquis', 'fast food']],
  ['sante', ['pharmacie', 'medecin', 'docteur', 'hopital', 'sante', 'medicament']],
  ['education', ['ecole', 'scolarite', 'formation', 'cours', 'fournitures']],
  ['vetements', ['vetement', 'habits', 'chaussure', 'fringue']],
  ['abonnement', ['abonnement', 'netflix', 'spotify', 'canal+']],
  ['loyer', ['loyer']],
  ['telephone', ['telephone', 'forfait', 'credit tel', 'unites']],
  ['loisirs', ['cinema', 'cine', 'concert', 'loisir', 'sortie', 'jeu']],
]

export function suggestCategory(label: string): Category | null {
  const text = normalize(label)
  if (!text.trim()) return null

  for (const [category, keywords] of KEYWORDS) {
    if (keywords.some((kw) => text.includes(kw))) return category
  }

  return null
}
