<?php
//https://api.mole.upol.cz/Init/<pdbid>

$pdbid = $_GET["pdbid"];

$resultJson = file_get_contents("https://api.mole.upol.cz/Init/".$pdbid);
$json = json_decode($resultJson);

header('Location: \online/'.$json->ComputationId);
die();
?>