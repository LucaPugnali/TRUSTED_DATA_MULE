@echo off

REM Definisci il nome del file
set fileName=DataMuleContract.json

REM Definisci i percorsi delle directory di destinazione
set destDir1=..\..\_sender\src\contracts
set destDir2=..\..\_recipient\src\contracts
set destDir3=..\..\_data_mule\contracts

REM Controlla se esiste il file nella directory corrente
if exist ".\%fileName%" (
    REM Copia il file nelle directory di destinazione
    copy ".\%fileName%" "%destDir1%"
    copy ".\%fileName%" "%destDir2%"
    copy ".\%fileName%" "%destDir3%"

    echo File %fileName% copiato con successo.
) else (
    echo File %fileName% non trovato.
)
