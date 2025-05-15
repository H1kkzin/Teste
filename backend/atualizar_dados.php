<?php

require_once 'conexao.php';

$api_Key = "8fb9c33ecb8c75a1e7232d29c37fc7ee";
$city = "Brasilia";

$api_url = "https://api.openweathermap.org/data/2.5/weather?q=$city&appid=$api_Key&units=metric";

$response = file_get_contents($api_url);

if ($response === false) {
    die("Erro ao acessar a API.");
}

$data = json_decode($response, true);

if ($data === null) {
    die("Erro ao decodificar a resposta da API.");
}

$temperatura = $data['main']['temp'];
$dataHoraAtual = date('Y-m-d H:i:s');

if ($temperatura > 28) {
    $eficiencia = 100;
} elseif ($temperatura < 24) {
    $eficiencia = 75;
} else {
    $eficiencia =  75 + (100 - 75) * ($temperatura - 24) / (28 - 24);
}

$temperatura_formatada = round($temperatura, 2);
$eficiencia_formatada = round($eficiencia, 2);
$dataHoraAtual_formatada = $conexao->real_escape_string($dataHoraAtual);

$query = "INSERT INTO registros (dataehora, temperatura, eficiencia) VALUES ('$dataHoraAtual_formatada', '$temperatura_formatada', '$eficiencia_formatada')";

if ($conexao->query($query) === TRUE) {
    echo json_encode(["sucesso" => true, "temperatura_atual" => $temperatura_formatada, "eficiencia_atual" => $eficiencia_formatada, "ultima_atualizacao" => $dataHoraAtual]);
} else {
    echo json_encode(["erro" => "Erro ao inserir dados no banco de dados: " . $conexao->error]);
}

$conexao->close();
?>