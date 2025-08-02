type Rows = {
    "annotation": string[],
    "channel": string[],
    "properties": string[],
    "layer": string[],
    "layer_weighted_properties": string[],
    "residue": string[],
    "layer_residue": string[],
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
_sb_ncbr_channel.type
_sb_ncbr_channel.method
_sb_ncbr_channel.software
_sb_ncbr_channel.auto
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
_sb_ncbr_channel_layer.channel_id
_sb_ncbr_channel_layer.order
_sb_ncbr_channel_layer.min_radius
_sb_ncbr_channel_layer.min_free_radius
_sb_ncbr_channel_layer.start_distance
_sb_ncbr_channel_layer.end_distance
_sb_ncbr_channel_layer.local_minimum
_sb_ncbr_channel_layer.bottleneck
_sb_ncbr_channel_layer.charge
_sb_ncbr_channel_layer.numPositives
_sb_ncbr_channel_layer.numNegatives
_sb_ncbr_channel_layer.hydrophobicity
_sb_ncbr_channel_layer.hydropathy
_sb_ncbr_channel_layer.polarity
_sb_ncbr_channel_layer.mutability`,

    "layer_weighted_properties": `loop_
_sb_ncbr_channel_layer_weighted_props.channel_id  
_sb_ncbr_channel_layer_weighted_props.hydropathy
_sb_ncbr_channel_layer_weighted_props.hydrophobicity
_sb_ncbr_channel_layer_weighted_props.mutability
_sb_ncbr_channel_layer_weighted_props.polarity
_sb_ncbr_channel_layer_weighted_props.logD
_sb_ncbr_channel_layer_weighted_props.logP
_sb_ncbr_channel_layer_weighted_props.logS`,

    "residue": `loop_
_sb_ncbr_channel_residue.channel_id
_sb_ncbr_channel_residue.order
_sb_ncbr_channel_residue.backbone
_sb_ncbr_channel_residue.chain_id
_sb_ncbr_channel_residue.sequence_number`,

    "layer_residue": `loop_
_sb_ncbr_channel_layer_residue.layer_id
_sb_ncbr_channel_layer_residue.channel_id
_sb_ncbr_channel_layer_residue.order
_sb_ncbr_channel_layer_residue.residue_id`,

    "profile": `loop_
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

export const JSON2CIF = (name: string, data: string) => {
    const data_json = JSON.parse(data);
    if (!data_json) {
        return "No data loaded. Possibly because of refresh.";
    }

    const rows: Rows = {
        "annotation": [],
        "channel": [],
        "properties": [],
        "layer": [],
        "layer_weighted_properties": [],
        "residue": [],
        "layer_residue": [],
        "profile": []
    }

    for (const ann of data_json["Annotations"]) {
        const annotationId = rows.annotation.length + 1;
        rows.annotation.push(`${ann["Id"]} ${ann["ChannelId"] ? ann["ChannelId"] : '?'} "${ann["Name"]}" "${ann["Description"]}" "${ann["Reference"]}" ${ann["ReferenceType"]} `);
    }

    const methods = data_json["Channels"];
    for (const method in methods) {
        const channels = methods[method];
        for (const channel of channels) {
            const channelId = channel["Id"]
            const [method_name, software] = method.split("_");
            rows.channel.push(`${channelId} ${channel["Type"].replace(/\s/g, "_")} ${method_name} ${software} ${capitalize(channel["Auto"]) === 'True' ? 'YES' : 'NO'} ${channel["Cavity"]} `);

            const profiles: [] = channel["Profile"];
            for (const profile of profiles) {
                rows.profile.push(`${channelId} ${roundItems([profile["Radius"], profile["FreeRadius"], profile["Distance"], profile["T"], profile["X"], profile["Y"], profile["Z"]])} ${profile["Charge"]} `);
            }

            const layers = channel["Layers"];
            const layerWeightedProps = layers["LayerWeightedProperties"];
            // const residueFlow = layers["ResidueFlow"];
            const layersInfo = layers["LayersInfo"];
            const properties = channel["Properties"];

            rows.properties.push(`${channelId} ${properties.Charge} ${properties.Hydropathy} ${properties.Hydrophobicity} ${properties.Mutability} ${properties.NumNegatives} ${properties.NumPositives} ${properties.Polarity} ${properties.LogD ?? '?'} ${properties.LogP ?? '?'} ${properties.LogS ?? '?'} ${properties.Ionizable ?? '?'} ${properties.BRadius ?? '?'}`)
            rows.layer_weighted_properties.push(`${channelId} ${layerWeightedProps.Hydropathy} ${layerWeightedProps.Hydrophobicity} ${layerWeightedProps.Mutability} ${layerWeightedProps.Polarity} ${layerWeightedProps.LogD ?? '?'} ${layerWeightedProps.LogP ?? '?'} ${layerWeightedProps.logS ?? '?'}`)

            for (const [order, layer] of layersInfo.entries()) {
                const properties = layer["Properties"];
                const geometry = layer["LayerGeometry"]

                const localMinimum = "LocalMinimum" in geometry ? `${capitalize(geometry["LocalMinimum"].toString()) === 'True' ? 'YES' : 'NO'}` : "NO";
                const bottleneck = "Bottleneck" in geometry ? `${capitalize(geometry["Bottleneck"].toString()) === 'True' ? 'YES' : 'NO'}` : "NO";
                const layerId = rows.layer.length + 1;

                rows.layer.push(`${channelId} ${order + 1} ${roundItems([geometry["MinRadius"], geometry["MinFreeRadius"], geometry["StartDistance"], geometry["EndDistance"]])} ${localMinimum} ${bottleneck} ${properties["Charge"]} ${properties["NumPositives"]} ${properties["NumNegatives"]} ${properties["Hydrophobicity"]} ${properties["Hydropathy"]} ${properties["Polarity"]} ${properties["Mutability"]} `);

                const residues = layer["Residues"];

                const flowIndicies = layer["FlowIndices"]
                let flow = 0;

                for (const res of residues) {
                    const split_res = res.split(" ");
                    const res_str = `${split_res[2]} ${split_res[1]} `
                    let resIdx = rows.residue.findIndex(item => {
                        const no_id_item = item.split(" ").slice(1).join(" ");
                        return no_id_item === res_str;
                    });

                    if (resIdx === -1) {
                        resIdx = rows.residue.length + 1;
                        rows.residue.push(`${channelId} ${resIdx} ${split_res.length > 3 ? "YES" : "NO"} ${res_str} `);
                        rows.layer_residue.push(`${layerId} ${channelId} ${flowIndicies[flow]} ${resIdx} `);
                    } else {
                        resIdx = resIdx + 1;
                    }
                    flow++;
                }
            }
        }
    }


    const cif = `
${rows.annotation.length > 0 ? headers.annotation : ''}
${rows.annotation.length > 0 ? rows.annotation.join("\n") : ''}

${rows.channel.length > 0 ? headers.channel : ''}
${rows.channel.length > 0 ? rows.channel.join("\n") : ''}

${rows.profile.length > 0 ? headers.profile : ''}
${rows.profile.length > 0 ? rows.profile.join("\n") : ''}

${rows.properties.length > 0 ? headers.properties : ''}
${rows.properties.length > 0 ? rows.properties.join("\n") : ''}

${rows.layer.length > 0 ? headers.layer : ''}
${rows.layer.length > 0 ? rows.layer.join("\n") : ''}

${rows.layer_weighted_properties.length > 0 ? headers.layer_weighted_properties : ''}
${rows.layer_weighted_properties.length > 0 ? rows.layer_weighted_properties.join("\n") : ''}

${rows.residue.length > 0 ? headers.residue : ''}
${rows.residue.length > 0 ? rows.residue.join("\n") : ''}

${rows.layer_residue.length > 0 ? headers.layer_residue : ''}
${rows.layer_residue.length > 0 ? rows.layer_residue.join("\n") : ''}
            `
    return `${cif} `;
};

export function cleanCifContent(cif: string): string {
  const lines = cif.split(/\r?\n/);
  const result: string[] = [];

  let inLoop = false;
  let loopHeaders: string[] = [];
  let loopLines: string[] = [];
  let keepLoop = true;
  let loopType: "audit_conform" | "sbncbr" | null = null;

  const flushLoop = () => {
    if (!inLoop) return;

    if (loopType === "audit_conform") {
      const filteredLines = loopLines.filter(
        line => !line.trim().startsWith("mmcif_tunnels.dic")
      );
      if (filteredLines.length > 0) {
        result.push("loop_", ...loopHeaders, ...filteredLines);
      }
    } else if (loopType === "sbncbr") {
      // Skip this loop entirely
    } else if (keepLoop) {
      result.push("loop_", ...loopHeaders, ...loopLines);
    }

    // Reset state
    inLoop = false;
    loopHeaders = [];
    loopLines = [];
    keepLoop = true;
    loopType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "loop_") {
      flushLoop();
      inLoop = true;
      continue;
    }

    if (inLoop) {
      if (trimmed.startsWith("_")) {
        loopHeaders.push(line);
        if (trimmed.startsWith("_sb_ncbr_channel")) {
          loopType = "sbncbr";
          keepLoop = false;
        }
        if (trimmed.startsWith("_audit_conform.")) {
          loopType = "audit_conform";
        }
      } else if (
        trimmed === "" ||
        trimmed.startsWith("data_") ||
        trimmed.startsWith("loop_") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("_")
      ) {
        flushLoop();
        result.push(line);
      } else {
        loopLines.push(line);
      }
    } else {
      result.push(line);
    }
  }

  flushLoop(); // Final cleanup

  const cleaned = result.map(line => line.trimEnd()).filter(line => line !== "");
  return cleaned.join("\n") + "\n";
}

