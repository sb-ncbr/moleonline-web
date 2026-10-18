import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DGBody } from './UI';
import { ChannelsDBData } from '../../../Cache';
import { Residues } from '../../CommonUtils/Residues';

// the operator needs the loaded structure
vi.spyOn(Residues, 'getOperatorName').mockReturnValue('ASM_1');
const annotation = (text: string) => ({ text, reference: '', link: '' }) as any;
vi.spyOn(ChannelsDBData, 'getResidueAnnotationsImmediate').mockImplementation(id =>
    id === '65 A' ? [annotation('Binding site'), annotation('Active site')] : null);

describe('layer residues', () => {
    it('names a residue with several annotations like the others', () => {
        const html = renderToStaticMarkup(
            <DGBody data={[{ Residues: ['ARG 65 A', 'LEU 456 A Backbone'] } as any]} layerIds={[0]} selectionOn={false} />);
        expect(html).toContain('<td class="col col-1" rowspan="2"><strong>ARG 65 A</strong></td>');
        expect(html).toContain('<span>LEU 456 A Backbone</span>');
    });
});
