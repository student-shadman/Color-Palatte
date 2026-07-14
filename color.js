// Final Advanced Color Palette Tool JS

document.addEventListener("DOMContentLoaded", () => {
  const colorInput = document.getElementById("colorInput");
  const hexInput = document.getElementById("hexInput");
  const hexValue = document.getElementById("hexValue");
  const rgbValue = document.getElementById("rgbValue");
  const hslValue = document.getElementById("hslValue");
  const nameValue = document.getElementById("nameValue");
  const addToPalette = document.getElementById("addToPalette");
  const paletteGrid = document.getElementById("paletteGrid");
  const themeToggle = document.getElementById("themeToggle");
  const harmonyBtns = document.querySelectorAll(".harmony-btn");
  const harmonyDisplay = document.getElementById("harmonyDisplay");
  const bgColor = document.getElementById("bgColor");
  const textColor = document.getElementById("textColor");
  const contrastPreview = document.getElementById("contrastPreview");
  const contrastRatio = document.getElementById("contrastRatio");
  const contrastResult = document.getElementById("contrastResult");
  const downloadPalette = document.getElementById("downloadPalette");
  const uploadPalette = document.getElementById("uploadPalette");

  function hexToRgb(hex) {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res ? `rgb(${parseInt(res[1], 16)}, ${parseInt(res[2], 16)}, ${parseInt(res[3], 16)})` : null;
  }

  function hexToHsl(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16) / 255;
      g = parseInt(hex.slice(3, 5), 16) / 255;
      b = parseInt(hex.slice(5, 7), 16) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
      }
      h *= 60;
    }
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  function updateInfo(hex) {
    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);
    hexValue.textContent = hex;
    rgbValue.textContent = rgb;
    hslValue.textContent = hsl;
    nameValue.textContent = ntc.name(hex)[1];
  }

  colorInput.addEventListener("input", () => {
    hexInput.value = colorInput.value;
    updateInfo(colorInput.value);
  });

  hexInput.addEventListener("input", () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
      colorInput.value = hexInput.value;
      updateInfo(hexInput.value);
    }
  });

  addToPalette.addEventListener("click", () => {
    const color = colorInput.value;
    const div = document.createElement("div");
    div.style.backgroundColor = color;
    const span = document.createElement("span");
    span.textContent = color;
    div.appendChild(span);
    paletteGrid.appendChild(div);
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  harmonyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const base = colorInput.value;
      const hsl = hexToHsl(base).match(/\d+/g).map(Number);
      harmonyDisplay.innerHTML = "";
      let harmonies = [];
      if (btn.dataset.type === "complementary") {
        harmonies.push(`hsl(${(hsl[0] + 180) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
      } else if (btn.dataset.type === "analogous") {
        harmonies.push(`hsl(${(hsl[0] + 30) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
        harmonies.push(`hsl(${(hsl[0] - 30 + 360) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
      } else if (btn.dataset.type === "triadic") {
        harmonies.push(`hsl(${(hsl[0] + 120) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
        harmonies.push(`hsl(${(hsl[0] + 240) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
      } else if (btn.dataset.type === "tetradic") {
        harmonies.push(`hsl(${(hsl[0] + 90) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
        harmonies.push(`hsl(${(hsl[0] + 180) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
        harmonies.push(`hsl(${(hsl[0] + 270) % 360}, ${hsl[1]}%, ${hsl[2]}%)`);
      }
      harmonies.forEach(h => {
        const div = document.createElement("div");
        div.style.background = h;
        const span = document.createElement("span");
        span.textContent = h;
        div.appendChild(span);
        harmonyDisplay.appendChild(div);
      });
    });
  });

  function getLuminance(hex) {
    const rgb = hexToRgb(hex).match(/\d+/g).map(Number).map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  function getContrastRatio(bg, text) {
    const L1 = getLuminance(bg) + 0.05;
    const L2 = getLuminance(text) + 0.05;
    return (Math.max(L1, L2) / Math.min(L1, L2)).toFixed(2);
  }

  function updateContrastPreview() {
    const bg = bgColor.value;
    const text = textColor.value;
    contrastPreview.style.background = bg;
    contrastPreview.style.color = text;
    const ratio = getContrastRatio(bg, text);
    contrastRatio.textContent = `Ratio: ${ratio}`;
    contrastResult.textContent = ratio >= 4.5 ? "✔ Accessible (AA)" : "✘ Not Accessible";
  }

  bgColor.addEventListener("input", updateContrastPreview);
  textColor.addEventListener("input", updateContrastPreview);
  updateContrastPreview();

  downloadPalette.addEventListener("click", () => {
    const colors = [...paletteGrid.children].map(c => c.style.backgroundColor);
    const blob = new Blob([JSON.stringify(colors)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "palette.json";
    a.click();
  });

  uploadPalette.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const colors = JSON.parse(reader.result);
      colors.forEach(c => {
        const div = document.createElement("div");
        div.style.background = c;
        const span = document.createElement("span");
        span.textContent = c;
        div.appendChild(span);
        paletteGrid.appendChild(div);
      });
    };
    reader.readAsText(file);
  });
});

// NTC Color Names
// Load ntc.js library from: https://github.com/colorjs/color-name-list or use a simplified color name map.
const ntc = {
  name: function(hex) {
    const colors = {
      "#ffac33": "Orange",
      "#ffffff": "White",
      "#000000": "Black",
      // Add more basic mappings or integrate a larger dataset
    };
    return [hex, colors[hex.toLowerCase()] || "Unknown"];
  }
};
