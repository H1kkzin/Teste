<?php

$host = 'localhost';
$usuario = 'root';
$senha = '';
$bd = 'dados';

$conexao = new mysqli($host, $usuario, $senha, $bd);

if ($conexao->connect_error) {
    error_log("Falha na conexão com o banco de dados: " . $conexao->connect_error);
    http_response_code(500);
    echo json_encode(["sucesso" => false, "erro" => "Não foi possível conectar ao banco de dados. Tente novamente mais tarde."]);
    exit();    
}


$conexao->set_charset("utf8mb4");
error_log("Erro ao definir o charset da conexão: " . $conexao->error);
?>