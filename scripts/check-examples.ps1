param(
    [string]$SdkRoot = "$PSScriptRoot/../../sdk",
    [string]$KotlinHome = "$env:USERPROFILE/.konan/kotlin-native-prebuilt-windows-x86_64-2.2.20"
)
$ErrorActionPreference = 'Stop'
$wikiRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$output = Join-Path $wikiRoot 'dist/example-check'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$compiler = Join-Path $KotlinHome 'bin/konanc.bat'
$sources = @(Get-ChildItem -LiteralPath "$SdkRoot/kotlin/src" -Recurse -Filter *.kt | ForEach-Object FullName)
& $compiler -target mingw_x64 -produce library -o "$output/nimby-mod-api" @sources
if ($LASTEXITCODE) { throw 'API Kotlin compilation failed' }
& $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry wiki.tests.main -o "$output/wiki-example" "$wikiRoot/app/content/snippets/FirstMod.kt" "$wikiRoot/tests/mod-example.kt"
if ($LASTEXITCODE) { throw 'Wiki example compilation failed' }
& "$output/wiki-example.exe"
if ($LASTEXITCODE) { throw 'Wiki example checks failed' }
