<?php

declare(strict_types=1);

$projectRoot = __DIR__;
$updateDir = $projectRoot . DIRECTORY_SEPARATOR . '__xupdate';
$zipPath = $updateDir . DIRECTORY_SEPARATOR . 'master.zip';
$downloadUrl = 'https://github.com/HTML42/U42_Xtreme6/archive/refs/heads/master.zip';
$options = parseUpdateOptions($argv ?? []);

if ($options['help'] === true) {
    printUsage();
    exit(0);
}

echo "[X6 Update] Starte Update-Prozess...\n";
echo "Modus: " . ($options['dry_run'] ? 'dry-run/report (keine Dateien werden geschrieben)' : 'apply (x_*-Dateien werden plain überschrieben)') . "\n";

try {
    $extractedRoot = null;

    if ($options['source_dir'] !== null) {
        $extractedRoot = realpath((string) $options['source_dir']);
        if ($extractedRoot === false || !is_dir($extractedRoot)) {
            throw new RuntimeException('Source directory not found: ' . $options['source_dir']);
        }

        echo "[1/4] Verwende lokale Quelle: {$extractedRoot}\n";
    } else {
        ensureDirectory($updateDir);
        clearDirectory($updateDir);
        ensureDirectory($updateDir);

        echo "[1/4] Download: {$downloadUrl}\n";
        downloadFile($downloadUrl, $zipPath);

        echo "[2/4] Entpacke nach __xupdate/\n";
        $extractedRoot = unzipArchive($zipPath, $updateDir);
    }

    echo "[3/4] Suche x_*-Dateien rekursiv\n";
    $xFiles = findXFiles($extractedRoot);

    echo "Gefunden: " . count($xFiles) . " x_*-Dateien\n";

    echo $options['dry_run'] ? "[4/4] Report ohne Kopieren\n" : "[4/4] Kopiere Dateien ins Projekt\n";
    $report = processXFiles($xFiles, $extractedRoot, $projectRoot, $options['dry_run']);

    echo "Fertig. {$report['created']} neu, {$report['updated']} aktualisiert, {$report['unchanged']} unverändert, {$report['failed']} fehlgeschlagen.\n";
} finally {
    if ($options['source_dir'] === null) {
        clearDirectory($updateDir);
        if (is_dir($updateDir) && !rmdir($updateDir)) {
            throw new RuntimeException('Konnte __xupdate nicht löschen: ' . $updateDir);
        }

        echo "Cleanup: __xupdate wurde gelöscht.\n";
    }
}

function parseUpdateOptions(array $argv): array
{
    $options = [
        'dry_run' => false,
        'help' => false,
        'source_dir' => null,
    ];

    foreach (array_slice($argv, 1) as $arg) {
        if ($arg === '--help' || $arg === '-h') {
            $options['help'] = true;
            continue;
        }

        if ($arg === '--dry-run' || $arg === '--report') {
            $options['dry_run'] = true;
            continue;
        }

        if (str_starts_with($arg, '--source-dir=')) {
            $options['source_dir'] = substr($arg, strlen('--source-dir='));
            continue;
        }

        throw new InvalidArgumentException('Unknown option: ' . $arg);
    }

    return $options;
}

function printUsage(): void
{
    echo "Usage: php xtreme6_update.php [--dry-run|--report] [--source-dir=/path/to/U42_Xtreme6] [--help]\n";
    echo "\n";
    echo "Ohne Optionen lädt das Script den aktuellen Framework-Stand und überschreibt alle gefundenen x_*-Dateien plain.\n";
    echo "--dry-run / --report zeigt nur, welche x_*-Dateien neu, geändert oder unverändert wären.\n";
    echo "--source-dir nutzt eine lokale Framework-Quelle statt Download (nützlich für QA/Tests).\n";
}

function processXFiles(array $xFiles, string $sourceRoot, string $projectRoot, bool $dryRun): array
{
    $report = [
        'created' => 0,
        'updated' => 0,
        'unchanged' => 0,
        'failed' => 0,
    ];

    foreach ($xFiles as $sourceFile) {
        $relative = getRelativePath($sourceRoot, $sourceFile);
        if ($relative === '') {
            continue;
        }

        $targetFile = $projectRoot . DIRECTORY_SEPARATOR . $relative;
        $targetDir = dirname($targetFile);
        $targetExists = is_file($targetFile);
        $changed = true;

        if ($targetExists) {
            $sourceMd5 = normalizedMd5($sourceFile);
            $targetMd5 = normalizedMd5($targetFile);
            $changed = !($sourceMd5 !== false && $targetMd5 !== false && $sourceMd5 === $targetMd5);
        }

        if ($targetExists && !$changed) {
            $report['unchanged']++;
            echo "  = unverändert: {$relative}\n";
            continue;
        }

        if (!$targetExists) {
            $report['created']++;
            echo ($dryRun ? "  + würde neu anlegen: " : "  + neu angelegt: ") . $relative . "\n";
        } else {
            $report['updated']++;
            echo ($dryRun ? "  ! würde plain überschreiben: " : "  ! plain überschrieben: ") . $relative . "\n";
        }

        if ($dryRun) {
            continue;
        }

        ensureDirectory($targetDir);

        if (!copy($sourceFile, $targetFile)) {
            $report['failed']++;
            throw new RuntimeException('Konnte Datei nicht kopieren: ' . $relative);
        }
    }

    return $report;
}

function getRelativePath(string $root, string $path): string
{
    $root = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $root), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    $path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);

    if (!str_starts_with($path, $root)) {
        throw new RuntimeException('Path is outside source root: ' . $path);
    }

    return ltrim(substr($path, strlen($root)), DIRECTORY_SEPARATOR);
}

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

function normalizedMd5(string $path): string|false
{
    $content = @file_get_contents($path);
    if ($content === false) {
        return false;
    }

    $normalized = str_replace(["\r\n", "\r"], "\n", $content);
    return md5($normalized);
}

?>