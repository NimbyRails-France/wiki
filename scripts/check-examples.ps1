param(
    [string]$SdkRoot = "$PSScriptRoot/../../sdk",
    [string]$KotlinHome = "$env:USERPROFILE/.konan/kotlin-native-prebuilt-windows-x86_64-2.2.20"
)
$ErrorActionPreference = 'Stop'
$wikiRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$output = Join-Path $wikiRoot '.validation/example-check'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$compiler = Join-Path $KotlinHome 'bin/konanc.bat'
$sources = @(Get-ChildItem -LiteralPath "$SdkRoot/kotlin/src" -Recurse -Filter *.kt | ForEach-Object FullName)
& $compiler -target mingw_x64 -produce library -o "$output/nimby-mod-api" @sources
if ($LASTEXITCODE) { throw 'API Kotlin compilation failed' }
& node "$PSScriptRoot/export-examples.mjs"
if ($LASTEXITCODE) { throw 'English example extraction failed' }
foreach ($locale in @('fr','en')) {
    $sourceDirectory = if($locale -eq 'fr'){"$wikiRoot/app/content/snippets"}else{"$output/en"}
    $snippets = @(Get-ChildItem -LiteralPath $sourceDirectory -Filter *.kt | ForEach-Object FullName)
    & $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry wiki.tests.main -o "$output/wiki-example-$locale" @snippets "$wikiRoot/tests/mod-example.kt"
    if ($LASTEXITCODE) { throw "Wiki $locale example compilation failed" }
    & "$output/wiki-example-$locale.exe"
    if ($LASTEXITCODE) { throw "Wiki $locale example checks failed" }
}
