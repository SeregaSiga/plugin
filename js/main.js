document.addEventListener("DOMContentLoaded", function () {
    const maxWidthInput = document.getElementById("maxWidth");
    const enableBgCheckbox = document.getElementById("enableBackground");
    const bgColorInput = document.getElementById("bgColor");
    const bgOpacityInput = document.getElementById("bgOpacity");
    const opacityValue = document.getElementById("opacityValue");
    const fontFamilySelect = document.getElementById("fontFamily");
    const fontStyleSelect = document.getElementById("fontStyle");
    const applyButton = document.getElementById("applyBtn");
    const paddingXInput = document.getElementById("paddingX");
    const paddingYInput = document.getElementById("paddingY");
    const bgSettings = document.getElementById("backgroundSettings");

    // Обновление отображения прозрачности
    bgOpacityInput.addEventListener("input", () => {
        opacityValue.textContent = `${bgOpacityInput.value}%`;
    });

    enableBgCheckbox.addEventListener("change", () => {
        bgSettings.style.display = enableBgCheckbox.checked ? "block" : "none";
    });

    // ---------- [ ШРИФТЫ ] ----------

    function populateFontSelectors(fontArray) {
        if (fontArray && fontArray.length > 0) {
            // Очистим текущие элементы, если они есть
            fontFamilySelect.innerHTML = '';
            fontStyleSelect.innerHTML = '';

            // Добавляем шрифты в выпадающий список для fontFamily
            fontArray.forEach(function(font) {
                var option = document.createElement("option");
                option.value = font;
                option.textContent = font;
                fontFamilySelect.appendChild(option);
            });

            // Для начертания (fontStyle), добавим дефолтное "Regular"
            var defaultStyleOption = document.createElement("option");
            defaultStyleOption.value = "Regular";
            defaultStyleOption.textContent = "Regular";
            fontStyleSelect.appendChild(defaultStyleOption);
        } else {
            console.error("Не удалось получить шрифты");
        }
    }

    // ---------- [ Получение шрифтов и заполнение селектов ] ----------

    function fetchAndPopulateFonts() {
        var fontArray = getSystemFonts(); // Получаем список шрифтов

        // Проверим, были ли получены шрифты
        if (fontArray && fontArray.length > 0) {
            populateFontSelectors(fontArray);
        } else {
            console.error("Не удалось получить шрифты или шрифты пустые");
        }
    }

    // Вызываем функцию, чтобы заполнить выпадающие списки шрифтов
    fetchAndPopulateFonts();

    // ---------- [ Применение настроек ] ----------

    applyButton.addEventListener("click", () => {
        const settings = {
            maxWidth: parseInt(maxWidthInput.value, 10),
            enableBackground: enableBgCheckbox.checked,
            bgColor: bgColorInput.value,
            bgOpacity: parseInt(bgOpacityInput.value, 10),
            paddingX: parseInt(paddingXInput.value),
            paddingY: parseInt(paddingYInput.value),
            fontFamily: fontFamilySelect.value,
            fontStyle: fontStyleSelect.value
        };

        console.log("[Применение] Отправка настроек:", settings);

        if (typeof window.applySettings === "function") {
            window.applySettings(settings);
        } else {
            console.error("applySettings не найден");
        }
    });
});
