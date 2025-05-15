<?php 

require_once 'conexao.php';

$query = 'SELECT dataehora, temperatura, eficiencia FROM registros ORDER BY dataehora DESC';
$resultado = $conexao->query($query);

$historico = array();

if ($resultado) {
    while ($linha = $resultado->fetch_assoc()) {
        $historico[] = $linha;
    }
    $resultado->free();
} else {
    echo json_encode(["sucesso" => false, "erro" => $conexao->error]);
    $conexao->close();
    exit;
}

echo json_encode(["sucesso" => true, "historico" => $historico]);

$conexao->close();

?>