import React from "react";
import { PdbIdSign } from "../PdbIdSign/UI";
import { Annotate } from "../Annotate/UI";
import { DownloadReport } from "../DownloadReport/UI";
import { Help } from "../Help/UI";

export class ControlsTab extends React.Component<{}, {}> {
    componentDidMount() {
        
    }

    render() {
        return <>
            <div className="home-button" title="Home"><a href="/"> <img src="\images/molelogo.png"></img></a></div>
            <PdbIdSign />
            <Annotate/>
            <DownloadReport />
            <Help />
        </>
    }

}