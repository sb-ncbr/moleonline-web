<?php
//https://api.mole.upol.cz/Init/<pdbid>

$pdbid = $_GET["pdbid"];
$resultJson = file_get_contents("http://api.mole.upol.cz/Init/Pores/".$pdbid);
$json = json_decode($resultJson);

header('Location: \online/'.$json->ComputationId);
die();
?>
