<?php

require_once 'conexao.php';

if (!isset($conexao) || !($conexao instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "erro" => "Erro de conexão com o banco de dados."]);
    exit();
}


$query = 'SELECT dataehora, temperatura, eficiencia FROM registros ORDER BY dataehora DESC';


$resultado = $conexao->query($query);

$historico = array();


if ($resultado) {

    while ($linha = $resultado->fetch_assoc()) {
        $historico[] = $linha;
    }

    $resultado->free();
} else {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "erro" => "Erro ao consultar o banco de dados: " . $conexao->error]);
}
if ($resultado) {
    echo json_encode(["sucesso" => true, "historico" => $historico]);
}

$conexao->close();
