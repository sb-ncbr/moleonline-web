import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { annotatedResidueRows, annotationCell } from './Components';

const link = { text: 'G &rarr; D', reference: '11470997', link: 'https://europepmc.org/abstract/MED/11470997' } as any;
const plain = { text: 'Binding site', reference: '', link: '' } as any;
const html = (node: any) => renderToStaticMarkup(<table><tbody>{node}</tbody></table>);

describe('annotation rows', () => {
    it('shows an annotation as a link to its reference, as text, or as an empty mark', () => {
        expect(renderToStaticMarkup(annotationCell(link))).toBe('<a target="_blank" href="https://europepmc.org/abstract/MED/11470997">G &rarr; D</a>');
        expect(renderToStaticMarkup(annotationCell(plain))).toBe('<span>Binding site</span>');
        expect(renderToStaticMarkup(annotationCell({ ...plain, text: null }))).toBe('<span class="no-annotation"></span>');
    });

    it('spans the residue over a row for each annotation', () => {
        expect(html(annotatedResidueRows('LEU 456 A Backbone', <b>LEU 456 A</b>, [link, plain]))).toBe(
            '<table><tbody>'
            + '<tr title="LEU 456 A Backbone" class="help"><td class="col col-1" rowspan="2"><b>LEU 456 A</b></td><td class="col col-2"><a target="_blank" href="https://europepmc.org/abstract/MED/11470997">G &rarr; D</a></td></tr>'
            + '<tr><td class="col col-2"><span>Binding site</span></td></tr>'
            + '</tbody></table>');
    });

    it('leaves out the span and the backbone hint where they do not apply', () => {
        expect(html(annotatedResidueRows('ILE 317 A', 'ILE 317 A', [plain]))).toBe(
            '<table><tbody><tr title="" class=""><td class="col col-1">ILE 317 A</td><td class="col col-2"><span>Binding site</span></td></tr></tbody></table>');
    });
});
