import { PluginBehavior } from 'molstar/lib/mol-plugin/behavior';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { SbNcbrTunnelsPropertyProvider } from './property';

export const SbNcbrTunnelsExtension = PluginBehavior.create<{ autoAttach: boolean }>({
    name: 'sb-ncbr-tunnels-extension',
    category: 'misc',
    display: {
        name: 'SB NCBR Tunnels',
    },
    ctor: class extends PluginBehavior.Handler<{ autoAttach: boolean }> {
        register(): void {
            this.ctx.customModelProperties.register(SbNcbrTunnelsPropertyProvider, this.params.autoAttach);
        }
        unregister() {
            this.ctx.customModelProperties.unregister(SbNcbrTunnelsPropertyProvider.descriptor.name);
        }
    },
    params: () => ({
        autoAttach: PD.Boolean(true),
    })
});
