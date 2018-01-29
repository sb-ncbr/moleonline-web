<?php
//http://mole.upol.cz/api/ebi/?action=newjob&pdbid=1kfv&ignorehet=0&start=auto&x=21&y=15 

$pdbid = $_GET["pdbid"];
$ignorehet = $_GET["ignorehet"];

$resultJson = file_get_contents("http://api.mole.upol.cz/EBI/".$pdbid."?ignoreHet=".(($ignorehet==0)?"false":"true"));
$json = json_decode($resultJson);

header('Location: \online/'.$json->ComputationId."/1");
die();
?>

