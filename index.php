		
		<!--  
		   ╔═[ SYSTEM INFO ]══════════════════════════════════╗  
		   ║ Author  : Steve Dogs                             ║  
		   ║ Date    : 15.06.2025                             ║  
		   ║ Website : https://steve.dog                      ║  
		   ║ Contact : https://t.me/stevedog                  ║  
		   ╚══════════════════════════════════════════════════╝  
		   ────────────────────────────────────────────────────  
		   │ Modern Image Hosting - Main Gallery Page          │  
		   │ Features: 4 grid views, search, filters, sorting  │  
		   ────────────────────────────────────────────────────  
		-->

<?php include 'config.php'; ?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Hosting - example.com</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
  <div class="container">
    <header>
      <h1><i class="fa-solid fa-image"></i> Хостинг изображений</h1>
    </header>

    <section class="upload-section">
      <form method="post" enctype="multipart/form-data" action="upload.php">
        <div class="drop-zone">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Перетащите изображение сюда или нажмите для выбора</p>
          <input type="file" name="file" accept="image/*">
        </div>
        <div class="form-actions">
          <button class="upload-btn" type="submit"><i class="fa fa-upload"></i> Загрузить</button>
          <button class="clear-btn" type="reset"><i class="fa fa-times"></i> Очистить</button>
        </div>
      </form>
    </section>

    <section class="gallery">
      <h2><i class="fa-solid fa-photo-film"></i> Галерея</h2>
      <div class="image-list masonry">
        <?php
        $stmt = $pdo->query("SELECT * FROM images ORDER BY upload_date DESC");
        $imageCount = 0;
        foreach ($stmt as $row) {
          $imageCount++;
          $url = 'uploads/' . urlencode($row['filename']);
          $filepath = __DIR__ . '/uploads/' . $row['filename'];
          $filesize = file_exists($filepath) ? filesize($filepath) : 0;
          $filesizeFormatted = $filesize >= 1048576 ? round($filesize / 1048576, 2) . ' MB' : round($filesize / 1024, 2) . ' KB';
          $uploadDate = date("d.m.Y H:i", strtotime($row['upload_date']));
          $clientIp = $_SERVER['REMOTE_ADDR'];
          
          // Get image dimensions for better layout
          $imageDimensions = '';
          if (file_exists($filepath)) {
            $imageInfo = getimagesize($filepath);
            if ($imageInfo) {
              $width = $imageInfo[0];
              $height = $imageInfo[1];
              $aspectRatio = $height / $width;
              $imageDimensions = "data-aspect-ratio=\"{$aspectRatio}\" data-width=\"{$width}\" data-height=\"{$height}\"";
            }
          }

          echo '<div class="image-card" ' . $imageDimensions . ' data-upload-date="' . strtotime($row['upload_date']) . '" data-size="' . $filesize . '">';
          echo '<img src="' . $url . '" alt="' . htmlspecialchars($row['name']) . '" loading="lazy">';
          echo '<div class="image-overlay">' . $filesizeFormatted . '</div>';
          echo '<div class="image-info">';
          echo '<p><strong>' . htmlspecialchars($row['name']) . '</strong></p>';
          echo '<p>Размер: ' . $filesizeFormatted . '</p>';
          echo '<p>Загружено: ' . $uploadDate . '</p>';
          echo '<p><a href="' . $url . '" target="_blank">' . htmlspecialchars($url) . '</a></p>';
          echo '<div class="image-actions">';
          echo '<button class="copy-btn" onclick="copyToClipboard(\'' . $url . '\')"><i class="fa fa-copy"></i> Копировать</button>';
          if ($clientIp === '31.42.65.78') {
            echo '<button class="delete-btn" onclick="confirmDelete(\'' . intval($row['id']) . '\')"><i class="fa fa-trash"></i> Удалить</button>';
          }
          echo '</div></div></div>';
        }
        
        if ($imageCount === 0) {
          echo '<div class="empty-gallery">';
          echo '<i class="fas fa-images"></i>';
          echo '<h3>Галерея пуста</h3>';
          echo '<p>Загрузите первое изображение, чтобы начать</p>';
          echo '</div>';
        }
        ?>
      </div>
    </section>

    <footer>
      &copy; <?php echo date('Y'); ?> by steve.dog
    </footer>
  </div>

  <!-- Main Gallery JavaScript -->
  <script src="gallery.js"></script>
  
  <!-- Basic functionality -->
  <script>
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.querySelector('input[type="file"]');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          fileInput.files = e.dataTransfer.files;
          fileInput.closest('form').submit();
        }
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          fileInput.closest('form').submit();
        }
      });
    }

    function showNotification(message, type = 'success') {
      const notif = document.createElement('div');
      notif.className = `notification ${type}`;
      notif.textContent = message;
      document.body.appendChild(notif);
      setTimeout(() => notif.remove(), 5000);
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(window.location.origin + '/' + text).then(() => {
        showNotification('Ссылка скопирована!', 'success');
      }).catch(() => {
        showNotification('Не удалось скопировать ссылку.', 'error');
      });
    }

    function confirmDelete(id) {
      if (confirm('Вы действительно хотите удалить этот файл?')) {
        window.location.href = 'delete.php?id=' + id;
      }
    }
  </script>

  <?php if (isset($_GET['upload']) && $_GET['upload'] === 'ok'): ?>
    <script>showNotification('Файл успешно загружен!', 'success');</script>
  <?php elseif (isset($_GET['upload']) && $_GET['upload'] === 'fail'): ?>
    <script>showNotification('Ошибка загрузки файла.', 'error');</script>
  <?php elseif (isset($_GET['deleted']) && $_GET['deleted'] === 'ok'): ?>
    <script>showNotification('Файл удалён.', 'success');</script>
  <?php endif; ?>

</body>
</html>