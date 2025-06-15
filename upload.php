<?php
require 'config.php';

$targetDir = "uploads/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (isset($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES["file"]["tmp_name"];
    $originalName = basename($_FILES["file"]["name"]);
    $filename = uniqid() . '_' . $originalName;
    $targetFile = $targetDir . $filename;

    $type = mime_content_type($tmpName);
    if (strpos($type, 'image/') === 0) {
        if (move_uploaded_file($tmpName, $targetFile)) {
            $stmt = $pdo->prepare("INSERT INTO images (name, filename) VALUES (?, ?)");
            $stmt->execute([$originalName, $filename]);
            header("Location: index.php?upload=ok");
            exit;
        }
    }
}

header("Location: index.php?upload=fail");
exit;
