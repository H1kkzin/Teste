<?php

require_once 'conexao.php';

const API_KEY = "fa8cb76412204ea72d7a875cc0792712";
const CITY = "Brasilia";

$apiUrl = sprintf(
    "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric",
    urlencode(CITY),
    API_KEY
);

$response = @file_get_contents($apiUrl);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao acessar a API externa de clima."]);
    exit();
}

$data = json_decode($response, true);

if ($data === null || !isset($data['main']['temp'])) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao decodificar a resposta da API ou dados de temperatura ausentes."]);
    exit();
}

$temperatura = $data['main']['temp'];
$dataHoraAtual = date('Y-m-d H:i:s');

$eficiencia = 75;
if ($temperatura > 28) {
    $eficiencia = 100;
} elseif ($temperatura >= 24 && $temperatura <= 28) {

    $eficiencia = 75 + (100 - 75) * ($temperatura - 24) / (28 - 24);
}

$temperaturaFormatada = round($temperatura, 2);
$eficienciaFormatada = round($eficiencia, 2);

if (!isset($conexao) || !($conexao instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro de conexão com o banco de dados."]);
    exit();
}

$stmt = $conexao->prepare("INSERT INTO registros (dataehora, temperatura, eficiencia) VALUES (?, ?, ?)");

if ($stmt === false) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao preparar a consulta SQL: " . $conexao->error]);
    exit();
}


$stmt->bind_param("sdd", $dataHoraAtual, $temperaturaFormatada, $eficienciaFormatada);

if ($stmt->execute()) {
    echo json_encode([
        "sucesso" => true,
        "temperatura_atual" => $temperaturaFormatada,
        "eficiencia_atual" => $eficienciaFormatada,
        "ultima_atualizacao" => $dataHoraAtual
    ]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao inserir dados no banco de dados: " . $stmt->error]);
}


$stmt->close();
$conexao->close();
