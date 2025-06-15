<?php
require 'config.php';

if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];

    $stmt = $pdo->prepare("SELECT filename FROM images WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if ($row) {
        $file = 'uploads/' . $row['filename'];
        if (file_exists($file)) {
            unlink($file);
        }

        $pdo->prepare("DELETE FROM images WHERE id = ?")->execute([$id]);
        header("Location: index.php?deleted=ok");
        exit;
    }
}

header("Location: index.php?upload=fail");
exit;
