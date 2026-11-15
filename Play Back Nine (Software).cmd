@echo off
node "%~dp0tools\play-back-nine-software.mjs" %*
if errorlevel 1 pause
