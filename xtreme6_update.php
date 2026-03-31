<?php

declare(strict_types=1);

$projectRoot = __DIR__;
$updateDir = $projectRoot . DIRECTORY_SEPARATOR . '__xupdate';
$zipPath = $updateDir . DIRECTORY_SEPARATOR . 'master.zip';
$downloadUrl = 'https://github.com/HTML42/U42_Xtreme6/archive/refs/heads/master.zip';

echo "[X6 Update] Starte Update-Prozess...\n";

ensureDirectory($updateDir);
clearDirectory($updateDir);
ensureDirectory($updateDir);

echo "[1/4] Download: {$downloadUrl}\n";
downloadFile($downloadUrl, $zipPath);

echo "[2/4] Entpacke nach __xupdate/\n";
$extractedRoot = unzipArchive($zipPath, $updateDir);

echo "[3/4] Suche x_*-Dateien\n";
$xFiles = findXFiles($extractedRoot);

echo "Gefunden: " . count($xFiles) . " x_*-Dateien\n";

echo "[4/4] Kopiere Dateien ins Projekt\n";
$copied = 0;
$skipped = 0;
foreach ($xFiles as $sourceFile) {
    $relative = ltrim(str_replace($extractedRoot, '', $sourceFile), DIRECTORY_SEPARATOR);
    if ($relative === '') {
        continue;
    }

    $targetFile = $projectRoot . DIRECTORY_SEPARATOR . $relative;
    $targetDir = dirname($targetFile);

    ensureDirectory($targetDir);

    if (is_file($targetFile)) {
        $sourceMd5 = md5_file($sourceFile);
        $targetMd5 = md5_file($targetFile);

        if ($sourceMd5 !== false && $targetMd5 !== false && $sourceMd5 === $targetMd5) {
            $skipped++;
            echo "  = unverändert: {$relative}\n";
            continue;
        }
    }

    if (!copy($sourceFile, $targetFile)) {
        throw new RuntimeException('Konnte Datei nicht kopieren: ' . $relative);
    }

    $copied++;
    echo "  + aktualisiert: {$relative}\n";
}

echo "Fertig. {$copied} aktualisiert, {$skipped} unverändert übersprungen.\n";

function ensureDirectory(string $path): void
{
    if (!is_dir($path) && !mkdir($path, 0777, true) && !is_dir($path)) {
        throw new RuntimeException('Konnte Verzeichnis nicht erstellen: ' . $path);
    }
}

function clearDirectory(string $path): void
{
    if (!is_dir($path)) {
        return;
    }

    $items = scandir($path);
    if ($items === false) {
        throw new RuntimeException('Konnte Verzeichnis nicht lesen: ' . $path);
    }

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $full = $path . DIRECTORY_SEPARATOR . $item;
        if (is_dir($full)) {
            clearDirectory($full);
            if (!rmdir($full)) {
                throw new RuntimeException('Konnte Verzeichnis nicht löschen: ' . $full);
            }
            continue;
        }

        if (!unlink($full)) {
            throw new RuntimeException('Konnte Datei nicht löschen: ' . $full);
        }
    }
}

function downloadFile(string $url, string $targetPath): void
{
    $content = @file_get_contents($url);
    if ($content === false) {
        throw new RuntimeException('Download fehlgeschlagen: ' . $url);
    }

    if (file_put_contents($targetPath, $content) === false) {
        throw new RuntimeException('Konnte ZIP nicht schreiben: ' . $targetPath);
    }
}

function unzipArchive(string $zipPath, string $targetDir): string
{
    $zip = new ZipArchive();
    $openResult = $zip->open($zipPath);
    if ($openResult !== true) {
        throw new RuntimeException('ZIP konnte nicht geöffnet werden: ' . $zipPath);
    }

    if (!$zip->extractTo($targetDir)) {
        $zip->close();
        throw new RuntimeException('ZIP konnte nicht entpackt werden nach: ' . $targetDir);
    }

    $zip->close();

    $dirs = glob($targetDir . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];
    if ($dirs === []) {
        throw new RuntimeException('Kein entpacktes Root-Verzeichnis gefunden.');
    }

    return $dirs[0];
}

function findXFiles(string $root): array
{
    $result = [];

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $item) {
        if (!$item->isFile()) {
            continue;
        }

        $basename = strtolower($item->getBasename());
        if (str_starts_with($basename, 'x_')) {
            $result[] = $item->getPathname();
        }
    }

    sort($result);
    return $result;
}

?>