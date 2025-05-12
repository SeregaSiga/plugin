(function () {
    const csInterface = new CSInterface();
    
    // Получение списка шрифтов через ExtendScript
    function getFontList() {
        csInterface.evalScript('getSystemFonts()', function(result) {
            try {
                console.log("Получены шрифты: ", result);  // Логирование результата
                var fonts = JSON.parse(result);  // Преобразуем в массив
                console.log("Fonts array: ", fonts);  // Логируем массив шрифтов

                var fontSelect = document.getElementById("fontFamily");
                fontSelect.innerHTML = '';  // Очищаем старые опции

                // Заполняем выпадающий список шрифтами
                fonts.forEach(function(font) {
                    var option = document.createElement("option");
                    option.value = font;
                    option.textContent = font;
                    fontSelect.appendChild(option);
                });

                if (fonts.length > 0) {
                    updateFontStyles(fonts[0]);  // Обновление стилей для первого шрифта
                }
            } catch (e) {
                console.error("Ошибка при обработке шрифтов: ", e);
            }
        });
    }

    // Обновление стилей для выбранного шрифта
    function updateFontStyles(fontFamily) {
        getFontStyles(fontFamily, function(styles) {
            const styleSelect = document.getElementById("fontStyle");
            styleSelect.innerHTML = '';  // Очищаем старые опции

            // Добавляем стили для выбранного шрифта
            styles.forEach(function(style) {
                var option = document.createElement("option");
                option.value = style;
                option.textContent = style;
                styleSelect.appendChild(option);
            });
        });
    }

    // Получение стилей для выбранного шрифта
    function getFontStyles(fontFamily, callback) {
        csInterface.evalScript(`getFontStyles("${fontFamily}")`, function(result) {
            try {
                const styles = JSON.parse(result);  // Преобразуем в массив стилей
                callback(styles || []);  // Возвращаем стили через callback
            } catch (e) {
                console.error("Ошибка парсинга стилей:", e);
                callback([]);  // Если ошибка, возвращаем пустой массив стилей
            }
        });
    }

    // Применение настроек
    function applySettings(settings) {
        csInterface.evalScript(`applySettings(${JSON.stringify(settings)})`);
    }

    // Инициализация после загрузки документа
    document.addEventListener("DOMContentLoaded", function () {
        getFontList();  // Получаем список шрифтов

        const fontSelect = document.getElementById("fontFamily");
        fontSelect.addEventListener("change", function () {
            updateFontStyles(fontSelect.value);  // Обновляем стили при изменении шрифта
        });
    });

    window.getFontList = getFontList;
    window.getFontStyles = getFontStyles;
    window.applySettings = applySettings;
})();
