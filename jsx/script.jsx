
function ensureFontsHelperScript() {
    var folder = new Folder("C:/FontsHelper");

    // Проверка, существует ли папка
    if (!folder.exists) {
        var folderCreated = folder.create();
        if (!folderCreated) {
            alert("Не удалось создать папку 'FontsHelper'.");
            return;
        } else {
            alert("Папка 'FontsHelper' успешно создана.");
        }
    } else {
        alert("Папка 'FontsHelper' уже существует.");
    }

    var psScript = new File("C:/FontsHelper/getFonts.ps1");

    // Если скрипт ещё не существует — создаём его
    if (!psScript.exists) {
        var success = psScript.open("w"); // Открытие файла для записи
        if (!success) {
            alert("Не удалось открыть файл для записи.");
            return;
        } else {
            alert("Файл открыт для записи.");
        }

        // Записываем PowerShell-скрипт
        var psScriptContent = 
            '[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")\n' +
            '$fontList = (New-Object System.Drawing.Text.InstalledFontCollection)\n' +
            '$fontFile = "C:\\FontsHelper\\fonts.txt"\n' +
            'if (Test-Path $fontFile) { Remove-Item $fontFile }\n' +
            'foreach ($font in $fontList.Families) {\n' +
            '    Add-Content $fontFile $font.Name\n' +
            '}\n';
        psScript.write(psScriptContent); // Запись скрипта
        psScript.close(); // Закрытие файла
        alert("Скрипт PowerShell записан.");
    } else {
        alert("Скрипт 'getFonts.ps1' уже существует.");
    }
}

function getSystemFonts() {
    ensureFontsHelperScript(); // Убедимся, что скрипт создан

    var fontFilePath = "C:/FontsHelper/fonts.txt";
    var fontFile = new File(fontFilePath);

    // Проверка на существование файла
    if (fontFile.exists) {
        alert("Файл существует. Чтение содержимого...");

        fontFile.open("r");
        var contents = fontFile.read();
        fontFile.close();

        // Проверка содержимого
        if (contents) {
            alert("Содержимое файла:\n" + contents); // Вывод содержимого файла
            var fontArray = contents.split("\n").map(function(f) {
                return f.replace(/\r/g, "").trim();
            }).filter(function(f) {
                return f.length > 0;
            });

            if (fontArray.length > 0) {
                var firstThreeFonts = fontArray.slice(0, 3).join("\n");
                alert("Первые три шрифта в файле:\n" + firstThreeFonts);
                return fontArray;
            } else {
                alert("Файл пустой или шрифтов не найдено.");
            }
        } else {
            alert("Не удалось прочитать содержимое файла.");
        }
    } else {
        alert("Файл не существует. Запускаем PowerShell для создания файла.");
    }

    // Если файл не существует или пустой — запускаем PowerShell
    var psFilePath = "C:/FontsHelper/getFonts.ps1";
    var command = 'powershell -ExecutionPolicy Bypass -File "' + psFilePath + '"';
    system.callSystem(command);

    var attempts = 0;
    var fileCreated = false;

    while (attempts < 10) {
        $.sleep(1000);
        fontFile = new File(fontFilePath);
        if (fontFile.exists) {
            alert("Файл был создан. Чтение содержимого...");

            fontFile.open("r");
            var contents = fontFile.read();
            fontFile.close();

            // Проверка содержимого после создания файла
            if (contents) {
                alert("Содержимое нового файла:\n" + contents); // Вывод содержимого нового файла
                var fontArray = contents.split("\n").map(function(f) {
                    return f.replace(/\r/g, "").trim();
                }).filter(function(f) {
                    return f.length > 0;
                });

                if (fontArray.length > 0) {
                    fileCreated = true;
                    var firstThreeFonts = fontArray.slice(0, 3).join("\n");
                    alert("Первые три шрифта в новом файле:\n" + firstThreeFonts);
                    return fontArray;
                } else {
                    alert("Файл пустой или шрифтов не найдено.");
                    break;
                }
            } else {
                alert("Не удалось прочитать содержимое файла.");
                break;
            }
        }
        attempts++;
    }

    if (!fileCreated) {
        alert("Не удалось создать файл с шрифтами.");
    }
}


// Применяет выбранный шрифт к тексту

// Основная функция применения настроек
function applySettings(settings) {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Нет активной композиции");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Нет выбранных слоёв");
        return;
    }

    app.beginUndoGroup("Применение настроек");

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (!(layer instanceof TextLayer)) continue;

        var textProp = layer.property("Source Text");
        var textDocument = textProp.value;
        var originalText = textDocument.text;



      if (settings.fontFamily) {
    var fontName = settings.fontFamily.trim(); // Убираем возможные пробелы по краям

    if (settings.fontStyle && settings.fontStyle.trim() !== "") {
        // Если начертание указано и не пустое
        textDocument.font = fontName + "-" + settings.fontStyle.trim(); // fontFamily + fontStyle
    } else {
        // Если начертание не указано, просто используем шрифт
        textDocument.font = fontName;
    }
}

        // Перенос текста по ширине с учётом висячих предлогов
        textDocument.text = wrapText(originalText, settings.maxWidth, layer);
        textProp.setValue(textDocument);

        // Добавляем или настраиваем подложку
        if (settings.enableBackground) {
            addTextBackground(layer, settings.bgColor, settings.bgOpacity, settings.paddingX, settings.paddingY);
        }
    }

    app.endUndoGroup();
}

// Функция переноса текста по ширине с учётом висячих предлогов
function wrapText(text, maxLineWidth, layer) {
    var words = text.split(" ");
    var currentLine = "";
    var result = "";

    var danglingPrepositions = ["в", "на", "с", "к", "о", "у", "за", "от", "до", "по", "и", "а", "но", "или", "да"];

    function getTextWidth(text) {
        var tempDoc = layer.property("Source Text").value;
        tempDoc.text = text;
        layer.property("Source Text").setValue(tempDoc);
        return layer.sourceRectAtTime(0, false).width;
    }

    for (var i = 0; i < words.length; i++) {
        var testLine = currentLine + (currentLine === "" ? "" : " ") + words[i];
        var testLineWidth = getTextWidth(testLine);

        if (testLineWidth <= maxLineWidth) {
            currentLine = testLine;
        } else {
            var lastWord = currentLine.split(" ").pop();
            var isDangling = false;
            for (var j = 0; j < danglingPrepositions.length; j++) {
                if (danglingPrepositions[j] === lastWord.toLowerCase()) {
                    isDangling = true;
                    break;
                }
            }

            if (isDangling) {
                currentLine = currentLine.substring(0, currentLine.lastIndexOf(" "));
                result += (result === "" ? "" : "\n") + currentLine;
                currentLine = lastWord + " " + words[i];
            } else {
                result += (result === "" ? "" : "\n") + currentLine;
                currentLine = words[i];
            }
        }
    }
    if (currentLine !== "") {
        result += (result === "" ? "" : "\n") + currentLine;
    }
    return result;
}

// Функция добавления фона к тексту
function addTextBackground(textLayer, color, opacity, paddingX, paddingY) {
    var comp = textLayer.containingComp;
    var rect = textLayer.sourceRectAtTime(0, false);

    var bgWidth = Math.ceil(rect.width + paddingX * 2);
    var bgHeight = Math.ceil(rect.height + paddingY * 2);

    var bg = comp.layers.addSolid(hexToRGB(color), "Text Background", bgWidth, bgHeight, 1);
    bg.moveAfter(textLayer);

    var textPos = textLayer.position.value;
    var textAnchorX = rect.left + rect.width / 2;
    var textAnchorY = rect.top + rect.height / 2;

    var textAnchor = textLayer.anchorPoint.value;
    var deltaX = textAnchorX - textAnchor[0];
    var deltaY = textAnchorY - textAnchor[1];

    textLayer.anchorPoint.setValue([textAnchorX, textAnchorY]);
    textLayer.position.setValue([textPos[0] + deltaX, textPos[1] + deltaY]);

    bg.anchorPoint.setValue([bgWidth / 2, bgHeight / 2]);
    bg.position.setValue(textLayer.position.value);
    bg.parent = textLayer;

    bg.opacity.setValue(opacity);
}

// Функция преобразования HEX цвета в RGB
function hexToRGB(hex) {
    hex = hex.replace("#", "");
    return [parseInt(hex.substring(0, 2), 16) / 255, parseInt(hex.substring(2, 4), 16) / 255, parseInt(hex.substring(4, 6), 16) / 255];
}
