import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChordService {
  // Sequência de notas usando sustenidos
  private notes: string[] = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];

  /**
   * Transpõe um acorde individual.
   * @param chord O acorde original (ex.: "Am", "F#m")
   * @param semitones Quantidade de semitons para transpor
   * @returns O acorde transposto
   */
  transposeChord(chord: string, semitones: number): string {
    let baseNote = '';
    let remainder = '';

    // Verifica se o acorde possui dois caracteres (ex.: "F#" ou "Db")
    if (chord.length > 1 && (chord[1] === '#' || chord[1] === 'b')) {
      baseNote = chord.substring(0, 2);
      remainder = chord.substring(2);
    } else {
      baseNote = chord.substring(0, 1);
      remainder = chord.substring(1);
    }

    // Converte notas com "b" para o equivalente com "#"
    if (baseNote.includes('b')) {
      const conversion: { [key: string]: string } = {
        Db: 'C#',
        Eb: 'D#',
        Gb: 'F#',
        Ab: 'G#',
        Bb: 'A#',
      };
      baseNote = conversion[baseNote] || baseNote;
    }

    const index = this.notes.indexOf(baseNote);
    if (index === -1) {
      // Se não identificar o acorde, retorna-o inalterado
      return chord;
    }

    // Calcula o novo índice (usando aritmética modular)
    const newIndex =
      (index + semitones + this.notes.length) % this.notes.length;
    return this.notes[newIndex] + remainder;
  }

  /**
   * Transpõe os acordes presentes em um texto.
   * O texto é dividido de forma a preservar espaços e quebras de linha.
   * Para cada token identificado como acorde, o mesmo é envolvido em uma tag <span class="chord">
   *
   * @param text Texto com letras e acordes
   * @param semitones Quantidade de semitons para transpor
   * @returns Texto com os acordes transpostos e destacados em HTML
   */
  transposeText(text: string, semitones: number): string {
    // Divide o texto preservando espaços e quebras (capturando os separadores)
    return text
      .split(/(\s+)/)
      .map((token) => {
        if (/^\s+$/.test(token)) {
          return token; // não altera espaços em branco
        }
        if (this.isChord(token)) {
          const transposed = this.transposeChord(token, semitones);
          return `<span class="chord">${transposed}</span>`;
        }
        return token;
      })
      .join('');
  }

  /**
   * Verifica se um trecho pode ser considerado um acorde.
   * Remove caracteres comuns e testa se inicia com A-G, com possibilidade de ter # ou b.
   * @param word Trecho a ser verificado
   * @returns true se for considerado acorde, false caso contrário
   */
  isChord(word: string): boolean {
    // Remove caracteres indesejados (colchetes, parênteses, vírgulas, pontos, etc.)
    const cleaned = word.replace(/[\[\](),.]/g, '');
    // Expressão regular que reconhece acordes simples e com modificadores
    // Exemplo de acordes válidos: A, Am, Amaj7, F#m, Bb, Gdim, Csus4, etc.
    return /^[A-G](#|b)?(m|min|M|maj|dim|aug|sus)?\d*$/.test(cleaned);
  }
}
