import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ChordService } from '../chord.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements AfterViewInit {
  semitones: number = 0;
  capo: number | null = null;
  fontSize: string = '16px';

  // Armazena o texto "original" (sem transposição aplicada)
  originalText: string = 'Digite sua música com cifras aqui...';
  editorSafeHtml: SafeHtml = '';

  @ViewChild('editorDiv') editorDiv!: ElementRef<HTMLDivElement>;

  constructor(
    private chordService: ChordService,
    private sanitizer: DomSanitizer
  ) {}

  ngAfterViewInit(): void {
    // Inicializa o editor com o texto original
    this.updateEditor();
  }

  /**
   * Atualiza o texto base a partir do conteúdo atual do editor.
   * Esse método é chamado quando o editor perde o foco (blur).
   */
  updateOriginalText(): void {
    // Atualiza originalText com o conteúdo atual (sem tags HTML) do editor.
    this.originalText = this.editorDiv.nativeElement.innerText;
  }

  /**
   * Aplica a transposição sobre o texto base e atualiza o conteúdo do editor.
   * Esse método é disparado quando o usuário altera os valores de semitons ou capotraste.
   */
  transpose(): void {
    // Antes de aplicar a transposição, atualizamos a base com o conteúdo atual do editor
    // (caso o usuário tenha saído do campo ou clicado em um input).
    this.updateOriginalText();

    // Calcula a transposição efetiva: semitons informados - capotraste (reduz o tom)
    let effectiveSemitones = this.semitones;
    if (this.capo) {
      effectiveSemitones -= this.capo;
    }

    // Aplica a transposição sobre a versão "original" do texto
    const result = this.chordService.transposeText(
      this.originalText,
      effectiveSemitones
    );

    // Atualiza o editor com o resultado formatado (HTML com <span class="chord">)
    this.editorSafeHtml = this.sanitizer.bypassSecurityTrustHtml(result);

    // Atualiza também a base para evitar reaplicações cumulativas
    this.originalText = this.editorDiv.nativeElement.innerText;
  }

  /**
   * Atualiza o conteúdo do editor com o texto base.
   */
  updateEditor(): void {
    this.editorSafeHtml = this.sanitizer.bypassSecurityTrustHtml(
      this.originalText
    );
  }

  downloadPdf(): void {
    // Opcional: use um scale maior para melhorar a resolução (ex.: scale: 2)
    html2canvas(this.editorDiv.nativeElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Obtém as propriedades da imagem para calcular a proporção
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Calcula a altura do PDF mantendo a proporção da imagem
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Adiciona a imagem no PDF com as dimensões calculadas
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('musica.pdf');
    });
  }
}
