type Rows = {
    "annotation": string[],
    "channel": string[],
    "properties": string[],
    "layer": string[],
    "layer_weighted_properties": string[],
    "residue": string[],
    "layer_residue": string[],
    "hetResidue": string[],
    "profile": string[]
}
const roundItems = (values: string[]) => {
    let result = "";
    for (const value of values) {
        const rounded = parseFloat(value).toFixed(3);
        result += `${parseFloat(rounded).toFixed(3)} `
    }

    return result;
};

const capitalize = (str: string | boolean) => {
    const asStr = str.toString();
    return `${asStr.charAt(0).toUpperCase()}${asStr.slice(1)}`;
};

export const JSON2CIF = (name: string, data: string) => {
    const headers = {
        "annotation": `loop_
_sb_ncbr_channel_annotation.id
_sb_ncbr_channel_annotation.channel_id
_sb_ncbr_channel_annotation.name
_sb_ncbr_channel_annotation.description
_sb_ncbr_channel_annotation.reference
_sb_ncbr_channel_annotation.reference_type`,

        "channel": `loop_
_sb_ncbr_channel.id
_sb_ncbr_channel.type # Path, Pore, etc
_sb_ncbr_channel.method # CSATunnel, etc
_sb_ncbr_channel.software # MOLE, Caver
_sb_ncbr_channel.auto # bool
_sb_ncbr_channel.cavity`,

        "properties": `loop_
_sb_ncbr_channel_props.channel_id
_sb_ncbr_channel_props.charge
_sb_ncbr_channel_props.hydropathy
_sb_ncbr_channel_props.hydrophobicity
_sb_ncbr_channel_props.mutability
_sb_ncbr_channel_props.numNegatives
_sb_ncbr_channel_props.numPositives
_sb_ncbr_channel_props.polarity
_sb_ncbr_channel_props.logD
_sb_ncbr_channel_props.logP
_sb_ncbr_channel_props.logS
_sb_ncbr_channel_props.ionizable
_sb_ncbr_channel_props.bRadius`,

        "layer": `loop_
_sb_ncbr_channel_layer.id
_sb_ncbr_channel_layer.channel_id
_sb_ncbr_channel_layer.order # order in channel
_sb_ncbr_channel_layer.min_radius
_sb_ncbr_channel_layer.min_free_radius
_sb_ncbr_channel_layer.start_distance
_sb_ncbr_channel_layer.end_distance
_sb_ncbr_channel_layer.local_minimum # bool
_sb_ncbr_channel_layer.bottleneck # bool
_sb_ncbr_channel_layer.charge
_sb_ncbr_channel_layer.numPositives
_sb_ncbr_channel_layer.numNegatives
_sb_ncbr_channel_layer.hydrophobicity
_sb_ncbr_channel_layer.hydropathy
_sb_ncbr_channel_layer.polarity
_sb_ncbr_channel_layer.mutability`,

        "layer_weighted_properties": `loop_
_sb_ncbr_channel_layer_props.channel_id  
_sb_ncbr_channel_layer_props.hydropathy
_sb_ncbr_channel_layer_props.hydrophobicity
_sb_ncbr_channel_layer_props.mutability
_sb_ncbr_channel_layer_props.polarity
_sb_ncbr_channel_layer_props.logD
_sb_ncbr_channel_layer_props.logP
_sb_ncbr_channel_layer_props.logS`,

        "residue": `loop_
_sb_ncbr_channel_residue.id
_sb_ncbr_channel_residue.name
_sb_ncbr_channel_residue.sequence_number # order
_sb_ncbr_channel_residue.chain_id # A, B`,

        "layer_residue": `loop_
_sb_ncbr_channel_layer_residue.layer_id
_sb_ncbr_channel_layer_residue.residue_id
_sb_ncbr_channel_layer_residue.flow
_sb_ncbr_channel_layer_residue.backbone # bool`,

        "het_residue": `loop_
_sb_ncbr_channel_het_residue.id
_sb_ncbr_channel_het_residue.channel_id
_sb_ncbr_channel_het_residue.name
_sb_ncbr_channel_het_residue.sequence_number
_sb_ncbr_channel_het_residue.chain_id
_sb_ncbr_channel_het_residue.bottleneck # bool`,

        "profile": `loop_
_sb_ncbr_channel_profile.id
_sb_ncbr_channel_profile.channel_id
_sb_ncbr_channel_profile.radius
_sb_ncbr_channel_profile.free_radius
_sb_ncbr_channel_profile.distance
_sb_ncbr_channel_profile.T
_sb_ncbr_channel_profile.x
_sb_ncbr_channel_profile.y
_sb_ncbr_channel_profile.z
_sb_ncbr_channel_profile.charge`,
    }

    const data_json = JSON.parse(data);
    if (!data_json) {
        return "No data loaded. Possibly because of refresh.";
    }

    // const file_id = name //.split(" ")[1]
    const rows: Rows = {
        "annotation": [],
        "channel": [],
        "properties": [],
        "layer": [],
        "layer_weighted_properties": [],
        "residue": [],
        "layer_residue": [],
        "hetResidue": [],
        "profile": []
    }

    for (const ann of data_json["Annotations"]) {
        const annotationId = rows.annotation.length + 1;
        rows.annotation.push(`${annotationId} ${ann["Id"]} "${ann["Name"]}" "${ann["Description"]}" "${ann["Reference"]}" ${ann["ReferenceType"]} `);
    }

    const methods = data_json["Channels"];
    for (const method in methods) {
        const channels = methods[method];
        for (const channel of channels) {
            const channelId = channel["Id"]
            const [method_name, software] = method.split("_");
            rows.channel.push(`${channelId} ${channel["Type"].replace(/\s/g, "_")} ${method_name} ${software} ${capitalize(channel["Auto"])} ${channel["Cavity"]} `);

            const profiles: [] = channel["Profile"];
            for (const profile of profiles) {
                rows.profile.push(`${rows.profile.length + 1} ${channelId} ${roundItems([profile["Radius"], profile["FreeRadius"], profile["Distance"], profile["T"], profile["X"], profile["Y"], profile["Z"]])} ${profile["Charge"]} `);
            }

            const layers = channel["Layers"];
            const hets = layers["HetResidues"];
            const layerWeightedProps = layers["LayerWeightedProperties"];
            // const residueFlow = layers["ResidueFlow"];
            const layersInfo = layers["LayersInfo"];
            const properties = channel["Properties"];
            for (const het of hets) {
                const split_het = het.split(" ");
                const hetId = rows.hetResidue.length + 1;
                rows.hetResidue.push(`${hetId} ${channelId} ${split_het[0]} ${split_het[1]} ${split_het[2]} ${split_het.length > 3 ? "True" : "False"} `)
            }


            // for (const res of residueFlow) {
            //     const split_res = res.split(" ");
            //     const 
            // }
            rows.properties.push(`${channelId} ${properties.Charge} ${properties.Hydropathy} ${properties.Hydrophobicity} ${properties.Mutability} ${properties.NumNegatives} ${properties.NumPositives} ${properties.Polarity} ${properties.LogD ?? 'null'} ${properties.LogP ?? 'null'} ${properties.LogS ?? 'null'} ${properties.Ionizable ?? 'null'} ${properties.BRadius ?? 'null'}`)
            rows.layer_weighted_properties.push(`${channelId} ${layerWeightedProps.Hydropathy} ${layerWeightedProps.Hydrophobicity} ${layerWeightedProps.Mutability} ${layerWeightedProps.Polarity} ${layerWeightedProps.LogD ?? 'null'} ${layerWeightedProps.LogP ?? 'null'} ${layerWeightedProps.logS ?? 'null'}`)

            for (const [order, layer] of layersInfo.entries()) {
                const properties = layer["Properties"];
                const geometry = layer["LayerGeometry"]

                const localMinimum = "LocalMinimum" in geometry ? `${capitalize(geometry["LocalMinimum"].toString())}` : "False";
                const bottleneck = "Bottleneck" in geometry ? `${capitalize(geometry["Bottleneck"].toString())}` : "False";
                const layerId = rows.layer.length + 1;

                rows.layer.push(`${layerId} ${channelId} ${order + 1} ${roundItems([geometry["MinRadius"], geometry["MinFreeRadius"], geometry["StartDistance"], geometry["EndDistance"]])} ${localMinimum} ${bottleneck} ${properties["Charge"]} ${properties["NumPositives"]} ${properties["NumNegatives"]} ${properties["Hydrophobicity"]} ${properties["Hydropathy"]} ${properties["Polarity"]} ${properties["Mutability"]} `);

                const residues = layer["Residues"];

                const flowIndicies = layer["FlowIndices"]
                let flow = 0;

                for (const res of residues) {
                    const split_res = res.split(" ");
                    const res_str = `${split_res[0]} ${split_res[1]} ${split_res[2]} `
                    let resIdx = rows.residue.findIndex(item => {
                        const no_id_item = item.split(" ").slice(1).join(" ");
                        return no_id_item === res_str;
                    });

                    if (resIdx === -1) {
                        resIdx = rows.residue.length + 1;
                        rows.residue.push(`${resIdx} ${res_str} `);
                    } else {
                        resIdx = resIdx + 1;
                    }
                    rows.layer_residue.push(`${layerId} ${resIdx} ${flowIndicies[flow]} ${split_res.length > 3 ? "True" : "False"} `);
                    flow++;
                }
            }
        }
    }

    const cif = `
${headers.annotation}
${rows.annotation.join("\n")}

${headers.channel}
${rows.channel.join("\n")}

${headers.profile}
${rows.profile.join("\n")}

${headers.properties}
${rows.properties.join("\n")}

${headers.layer}
${rows.layer.join("\n")}

${headers.layer_weighted_properties}
${rows.layer_weighted_properties.join("\n")}

${headers.residue}
${rows.residue.join("\n")}

${headers.layer_residue}
${rows.layer_residue.join("\n")}

${headers.het_residue}
${rows.hetResidue.join("\n")}
            `
    return `${cif} `;
};