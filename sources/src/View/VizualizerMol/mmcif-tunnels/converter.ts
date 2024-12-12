type Rows = {
    "annotation": string[],
    "channel": string[],
    "layer": string[],
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

    const file_id = name //.split(" ")[1]
    const rows: Rows = {
        "annotation": [],
        "channel": [],
        "layer": [],
        "residue": [],
        "layer_residue": [],
        "hetResidue": [],
        "profile": []
    }

    for (const ann of data_json["Annotations"]) {
        rows.annotation.push(`${ann["Id"]} "${ann["Name"]}" "${ann["Description"]}" "${ann["Reference"]}" ${ann["ReferenceType"]} `);
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
            const layersInfo = layers["LayersInfo"];
            for (const het of hets) {
                const split_het = het.split(" ");
                const hetId = rows.hetResidue.length + 1;
                rows.hetResidue.push(`${hetId} ${channelId} ${split_het[0]} ${split_het[1]} ${split_het[2]} ${split_het.length > 3 ? "True" : "False"} `)
            }

            for (const [order, layer] of layersInfo.entries()) {
                const properties = layer["Properties"];
                const geometry = layer["LayerGeometry"]

                const localMinimum = "LocalMinimum" in geometry ? `${capitalize(geometry["LocalMinimum"].toString())}` : "False";
                const bottleneck = "Bottleneck" in geometry ? `${capitalize(geometry["Bottleneck"].toString())}` : "False";
                const layerId = rows.layer.length + 1;

                rows.layer.push(`${layerId} ${channelId} ${order + 1} ${roundItems([geometry["MinRadius"], geometry["MinFreeRadius"], geometry["StartDistance"], geometry["EndDistance"]])} ${localMinimum} ${bottleneck} ${properties["Charge"]} ${properties["NumPositives"]} ${properties["NumNegatives"]} ${properties["Hydrophobicity"]} ${properties["Hydropathy"]} ${properties["Polarity"]} ${properties["Mutability"]} `);

                const residues = layer["Residues"];
                for (const [flow, res] of residues.entries()) {
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
                    rows.layer_residue.push(`${layerId} ${resIdx} ${flow + 1} ${split_res.length > 3 ? "True" : "False"} `)
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

${headers.layer}
${rows.layer.join("\n")}

${headers.residue}
${rows.residue.join("\n")}

${headers.layer_residue}
${rows.layer_residue.join("\n")}

${headers.het_residue}
${rows.hetResidue.join("\n")}
            `

    return `${file_id} \n${cif} `;
};