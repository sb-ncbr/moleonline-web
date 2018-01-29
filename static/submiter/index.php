<?php
/*
 * Submitter script. Initializes computation for pdbid and submits one submit 
 * with configured parameters. Works only with pdbids having config json file
 * in /data directory
 */

$production = true;	//Set this to true in production environment !!!


$pdbid = $_GET["pdbid"];

$config = file_get_contents("./data/".strtolower($pdbid).".json");
$configJson = json_decode($config);

$upolApiUrl = "http://api.mole.upol.cz/";
$webchemApiUrl = "https://webchem.ncbr.muni.cz/API/MOLE/";

$url = ($production==True)?$upolApiUrl:$webchemApiUrl;    

$poresInit = ($configJson->PoresInit)?"/Pores":"";
$initResultJson = file_get_contents($url."Init".$poresInit."/".$pdbid);
$initJson = json_decode($initResultJson);
$compId = $initJson->ComputationId;
$submitId = $initJson->SubmitId;
$status = $initJson->Status;

do{
	Sleep(2);
	$resultJson = file_get_contents($url."Status/".$compId."?submitId=".$submitId);
	$json = json_decode($resultJson);
	$status = $json->Status;
}while($status==="Initializing");

$content = json_encode($configJson->Config);
$curl = curl_init($url."Submit/".$configJson->Mode."/".$compId);

curl_setopt($curl, CURLOPT_HEADER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-type: application/json"));
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $content);

$json_response = curl_exec($curl);

$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ( $status != 201 && $status != 200 ) {
    die("Error: call to URL $url failed with status $status, response $json_response, curl_error " . curl_error($curl) . ", curl_errno " . curl_errno($curl));
}

curl_close($curl);

header('Location: \online/'.$compId."/".$submitId);
die();
?>

