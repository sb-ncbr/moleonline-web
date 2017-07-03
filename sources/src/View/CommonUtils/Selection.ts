namespace CommonUtils.Selection{

    interface ChannelEventInfo { 
            kind: LiteMol.Bootstrap.Interactivity.Info.__Kind.Selection | LiteMol.Bootstrap.Interactivity.Info.__Kind.Empty,
            source : {
                props: {
                    tag: {
                        element: DataInterface.Tunnel,
                        type: String
                    }
                },
                ref: string
            }
            
        };

    export class SelectionHelper{
        private static SELECTION_VISUAL_REF = "res_visual";

        private static interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        public static getSelectionVisualRef(){
            return this.SELECTION_VISUAL_REF;
        }

        public static clearSelection(plugin:LiteMol.Plugin.Controller){
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
        }

        public static attachClearSelectionToEventHandler(plugin:LiteMol.Plugin.Controller){
            this.interactionEventStream = LiteMol.Bootstrap.Event.Visual.VisualSelectElement.getStream(plugin.context)
                    .subscribe(e => this.interactionHandler('select', e.data as ChannelEventInfo, plugin));
        }

        private static entitiesSame(entityIndices:number[], elements:number[]){
            if(entityIndices == void 0){
                return false;
            }
            if(elements == void 0){
                return false;
            }

            if(entityIndices.length!==elements.length){
                return false;
            }

            entityIndices.sort();
            elements.sort();
            
            for(let i=0;i<entityIndices.length;i++){
                if(entityIndices[i]!==elements[i]){
                    return false;
                }
            }

            return true;
        }

        private static interactionHandler(type: string, i: ChannelEventInfo | undefined, plugin: LiteMol.Plugin.Controller) {
            //console.log("SelectionHelper: Caught-SelectEvent");
            if (!i || i.source == null || i.source.ref === void 0) {
                //console.log("SelectionHelper: Event incomplete - ignoring");
                return;    
            }

            if(i.source.ref !== this.SELECTION_VISUAL_REF){
                let currentInCodeSelectedEntity = plugin.context.select(this.SELECTION_VISUAL_REF)[0];
                if(currentInCodeSelectedEntity!==void 0 && currentInCodeSelectedEntity.props !== void 0){
                    if(this.entitiesSame((currentInCodeSelectedEntity.props as any).indices,(i as any).elements)){
                        //console.log('SelectionHelper: Detected attempt to select selected item - reseting scene');
                        LiteMol.Bootstrap.Command.Visual.ResetScene.dispatch(plugin.context,void 0);
                    }
                }
                //console.log("SelectionHelper: SelectEvent from user interaction - clearing previous selection");
                SelectionHelper.clearSelection(plugin);
                return;
            }

            //console.log("SelectionHelper: SelectEvent from code - ignoring ");
        }

    }
}