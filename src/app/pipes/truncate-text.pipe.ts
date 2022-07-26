import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'truncateText'
})
export class TruncateTextPipe implements PipeTransform {

  transform(value: string, limit: number = 50, ellipses: string = '…'): string {
    const biggestWord = 10;

    if (typeof value === 'undefined' || value === null) {
      return value;
    }

    if (value.length <= limit) {
      return value;
    }

    let truncatedText = value.slice(0, limit + biggestWord);

    while (truncatedText.length > limit - ellipses.length) {
      const lastSpace = truncatedText.lastIndexOf(' ');

      if (lastSpace === -1) {
        break;
      }

      truncatedText = truncatedText.slice(0, lastSpace).replace(/[!,.?]$/, '');
    }

    return truncatedText + ellipses;
  }
}
