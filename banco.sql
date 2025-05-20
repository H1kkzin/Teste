-- Criar o banco de dados 'dados'
CREATE DATABASE IF NOT EXISTS dados;
USE dados;

-- Criar a tabela 'registros' 
CREATE TABLE IF NOT EXISTS registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataehora DATETIME,
    temperatura DECIMAL(5, 2),
    eficiencia DECIMAL(5, 2)
);