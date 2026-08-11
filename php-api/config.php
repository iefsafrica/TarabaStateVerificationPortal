<?php
// php-api/config.php

// This should be updated on your Namecheap server
$host = 'ep-restless-block-ayp0d2p5-pooler.c-5.us-east-2.aws.neon.tech';
$db = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_Ef9MRkINcVT7';

$dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}
?>
