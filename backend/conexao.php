<?php

$host = 'localhost';
$usuario = 'root';
$senha = '';
$bd = 'dados';

$conexao = new mysqli($host, $usuario, $senha, $bd);

if ($conexao->connect_error) {
    die("Falha na conexão com o banco de dados: " . $conexao->connect_error);
}

$conexao->set_charset("utf8");

?>