
(()=>{
  const t = {
    en: {
      "Accessibility Menu": "Accessibility menu",
      "Reset settings": "Reset settings",
      Close: "Close",
      "Content Adjustments": "Content Adjustments",
      "Adjust Font Size": "Adjust Font Size",
      Default: "ปกติ",
      "Highlight Title": "เน้นชื่อเรื่อง",
      "Highlight Links": "เน้นลิงค์",
      "Readable Font": "Readable Font",
      "Color Adjustments": "Color Adjustments",
      "Dark Contrast": "มืด",
      "Yellow Contrast": "เหลือง",
      "Light Contrast": "สว่าง",
      "High Contrast": "ความคมชัดสูง",
      "High Saturation": "ความอิ่มตัวสูง",
      "Low Saturation": "ความอิ่มตัวต่ำ",
      Monochrome: "ขาว-ดำ",
      Tools: "Tools",
      "Reading Guide": "ช่วยการอ่าน",
      "Stop Animations": "หยุดภาพเคลื่อนไหว",
      "Big Cursor": "เคอร์เซอร์ใหญ่",
      "Increase Font Size": "เพิ่มขนาดอักษร",
      "Decrease Font Size": "ลดขนาดอักษร",
      "Letter Spacing": "ขยายระยะห่างตัวอักษร",
      "Line Height": "เพิ่มความสูงตัวอักษร",
      "Font Weight": "ความเข้มตัวอักษร"
    },
  };

  const contrastButtons = [
    { label: "Monochrome",      key: "monochrome",      icon: "filter_b_and_w" },
    { label: "Low Saturation",  key: "low-saturation",  icon: "gradient" },
    { label: "High Saturation", key: "high-saturation", icon: "filter_vintage" },
    { label: "High Contrast",   key: "high-contrast",   icon: "tonality" },
    { label: "Light Contrast",  key: "light-contrast",  icon: "brightness_5" },
    { label: "Yellow Contrast", key: "yellow-contrast", icon: "nightlight" },
    { label: "Dark Contrast",   key: "dark-contrast",   icon: "dark_mode" },
  ];

  const contentButtons = [
    { label: "Font Weight",     key: "font-weight",     icon: "format_bold" },
    { label: "Line Height",     key: "line-height",     icon: "format_line_spacing" },
    { label: "Letter Spacing",  key: "letter-spacing",  icon: "space_bar" },
    { label: "ดีสเล็กซี่ฟ้อนท์", key: "readable-font",   icon: "spellcheck" },
    { label: "Highlight Links", key: "highlight-links", icon: "link" },
    { label: "Highlight Title", key: "highlight-title", icon: "title" },
  ];

  const toolButtons = [
    { label: "Big Cursor",       key: "big-cursor",        icon: "mouse" },
    { label: "Stop Animations",  key: "stop-animations",   icon: "motion_photos_off" },
    { label: "Reading Guide",    key: "readable-guide",    icon: "local_library" },
  ];

  class AccessibilityWidget {
    constructor(e) {
      this.config = { ...e };
      this.rendered = false;
      this.settings = { states: {}, lang: "en", ...(e?.settings || {}) };
      let i = document.documentElement.lang || "en";
      this.locale = t.en;
      if (t[i]) { this.settings.lang = i; this.locale = t[i]; }
      if (this.settings?.states) {
        this.changeControls();
        if (this.settings.states.fontSize !== 1) this.changeFont(null, this.settings.states.fontSize);
        if (this.settings.states.contrast) this.changeFilter(this.settings.states.contrast);
      }
    }

    toggle() {
      this.rendered || this.render();
      setTimeout(()=>{ this.menu.style.display = "block"; }, 0);
    }

    saveSettings() {
      this.setCookie("asw", JSON.stringify({ ...this.settings, updatedAt: new Date }));
    }

    setCookie(name, val, days = 3650) {
      const d = new Date();
      d.setTime(d.getTime() + 24 * days * 60 * 60 * 1000);
      document.cookie = `${name}=${val};expires=${d.toUTCString()};path=/`;
    }

    // ---------- NEW: จัดการคลาสธีมที่ <html> ----------
    setThemeClass(theme) {
      const html = document.documentElement;
      const themes = ['theme-light', 'theme-dark', 'theme-hc'];
      themes.forEach(c => html.classList.remove(c));
      if (theme) html.classList.add(theme);
    }

    render() {
      const n = ``;
      this.menu = document.createElement("div");
      this.menu.innerHTML =
      '<div class="asw-wrapper">\
        <div class="asw-relative">\
          <div class="menu-close" style=" display: none; "><span class="material-icons"> close </span></div>\
          <div class="asw-menu">\
            <div class="asw-menu-header">\
              <div class="asw-translate">  เมนูสำหรับผู้พิการ </div>\
              <div>\
                <div role="button" class="asw-menu-reset" title="เคลียร์การตั้งค่า">\
                  <span class="material-icons"> restart_alt </span>\
                </div>\
                <div role="button" class="asw-menu-close" title="ปิด">\
                  <span class="material-icons"> close </span>\
                </div>\
              </div>\
            </div>\
            <div class="asw-menu-content">\
              <div class="asw-card">\
                <div class="asw-card-title">การปรับแต่งเนื้อหา</div>\
                <div class="asw-adjust-font">\
                  <div class="asw-label" style="margin:0">\
                    <span class="material-icons" style="margin-right:8px">format_size</span>\
                    <div class="asw-translate">ปรับขนาดตัวอักษร</div>\
                  </div>\
                  <div>\
                    <div class="asw-minus" data-key="font-size" role="button" aria-pressed="false" title="Decrease Font Size">\
                      <span class="material-icons"> remove </span>\
                    </div>\
                    <div class="asw-amount" style="font-weight:400">Default</div>\
                    <div class="asw-plus" data-key="font-size" role="button" aria-pressed="false" title="Increase Font Size">\
                      <span class="material-icons">add</span>\
                    </div>\
                  </div>\
                </div>\
                <div class="asw-items content"></div>\
              </div>\
              <div class="asw-card">\
                <div class="asw-card-title">การปรับแต่งสี</div>\
                <div class="asw-items contrast"></div>\
              </div>\
              <div class="asw-card">\
                <div class="asw-card-title">เครื่องมือ</div>\
                <div class="asw-items tools"></div>\
              </div>\
            </div>\
            <div class="asw-footer">\
              <div class="brand"><img src="/app/template/assets/img/static/brand.svg"><p>กรมทรัพยากรทางทะเลและชายฝั่ง</p></div>\
            </div>\
          </div>\
          <div class="asw-overlay"></div>\
        </div>\
        <div class="asw-widget">\
          <a href="javascript:void(0);" class="asw-menu-btn active" title="เมนูสำหรับผู้พิการ" role="button" aria-expanded="false">\
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30px" height="30px">\
              <path d="M0 0h24v24H0V0z" fill="none"></path>\
              <path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>\
            </svg>\
          </a>\
        </div>\
      </div>';

      this.menu.querySelector(".content").innerHTML   = this._createButtons(contentButtons);
      this.menu.querySelector(".tools").innerHTML     = this._createButtons(toolButtons, "asw-tools");
      this.menu.querySelector(".contrast").innerHTML  = this._createButtons(contrastButtons, "asw-filter");

      this.menu.querySelector(".asw-menu-close").addEventListener("click", ()=> this.close());
      this.menu.querySelector(".asw-overlay").addEventListener("click", ()=> this.close());

      this.menu.querySelectorAll(".asw-btn").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          this.clickItem(btn);
        });
      });

      this.menu.querySelectorAll(".asw-adjust-font div[role='button']").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          this.changeFont(btn);
          this.saveSettings();
        });
      });

      this.menu.querySelector(".asw-menu-reset").addEventListener("click", ()=> this.reset());

      this.translate();
      this.config.container.appendChild(this.menu);
      this.rendered = true;
      return this;
    }

    reset() {
      this.settings.states = {};
      this.changeFilter();          // ล้าง data-asw-filter และสไตล์
      this.setThemeClass(null);     // <<< ล้าง theme-* ออกจาก <html>
      this.changeControls();
      this.changeFont(void 0, 1);
      this.saveSettings();
      this.menu.querySelectorAll(".asw-btn").forEach(btn=> btn.classList.remove("asw-selected"));
      this.translate();
    }

    changeFont(btn, scale) {
      if (!scale && btn) {
        scale = parseFloat(this.settings.states.fontSize) || 1;
        btn.classList.contains("asw-minus") ? (scale -= .1) : (scale += .1);
        scale = Math.max(scale, .1);
        scale = Math.min(scale, 2);
        scale = parseFloat(scale.toFixed(2));
      }
      document.querySelectorAll("h1,h3,h4,h5,h6,p,a,dl,dt,li,ol,th,td,span,blockquote,.asw-text").forEach(function(el) {
        if (!el.classList.contains("material-icons")) {
          let base = el.getAttribute("data-asw-orgFontSize");
          if (!base) {
            base = parseInt(window.getComputedStyle(el, null).getPropertyValue("font-size"));
            el.setAttribute("data-asw-orgFontSize", base);
          }
          let s = base * scale;
          el.style["font-size"] = s + "px";
        }
      });
      this.settings.states.fontSize = scale;
      this.translate();
    }

    clickItem(btn) {
      let key = btn.dataset.key;
      if (btn.classList.contains("asw-filter")) {
        document.querySelectorAll(".asw-filter").forEach(b=> b.classList.remove("asw-selected"));
        this.settings.states.contrast = this.settings.states.contrast !== key && key;
        if (this.settings.states.contrast) btn.classList.add("asw-selected");
        this.changeFilter(this.settings.states.contrast);
      } else {
        this.settings.states[key] = !this.settings.states[key];
        btn.classList.toggle("asw-selected", this.settings.states[key]);
        this.changeControls();
      }
      this.saveSettings();
    }

    close() {
      this.menu.querySelectorAll("div > .asw-wrapper").forEach(t=> t.classList.remove("active"));
    }

    changeControls() {
      let rules = [
        { id: "highlight-title",  childrenSelector: ["h1","h2","h3","h4","h5","h6"], css: "outline: 2px solid #0067B3 !important;outline-offset: 2px !important;" },
        { id: "highlight-links",  childrenSelector: ["a[href]"],                  css: "outline: 2px solid #0067B3 !important;outline-offset: 2px !important;" },
        { id: "readable-font",    childrenSelector: ["h1","h2","h3","h4","h5","h6","img","p","svg","a","button","label","li","ol",".wsite-headline",".wsite-content-title"], css: "font-family: OpenDyslexic3,Comic Sans MS,Arial,Helvetica,sans-serif !important;" },
        { id: "letter-spacing",   childrenSelector: ["",":not(.asw-wrapper *)"], css: "letter-spacing: 1px!important;" },
        { id: "line-height",      childrenSelector: ["h4","p"],                  css: "line-height: 1.4em!important;" },
        { id: "font-weight",      childrenSelector: ["",":not(.asw-wrapper *)"], css: "font-weight: 700!important;" },
      ];
      let css = "";
      for (let i = rules.length; i--;) {
        let r = rules[i];
        document.documentElement.classList.toggle(r.id, !!this.settings.states[r.id]);
        if (this.settings.states[r.id]) {
          for (let s = r.childrenSelector.length; s--;) {
            css += "." + r.id + " " + r.childrenSelector[s] + "{" + r.css + "}";
          }
        }
      }

      let rg = document.querySelector(".asw-rg-container");
      if (this.settings.states["readable-guide"]) {
        if (!rg) {
          let a = document.createElement("div");
          a.setAttribute("class", "asw-rg-container");
          a.innerHTML = '\
<style>.asw-rg {position: fixed;top: 0;left: 0;right: 0;width: 100%;height: 0;pointer-events: none;background-color: rgba(0,0,0,.5);z-index: 1000000;}</style>\
<div class="asw-rg asw-rg-top"></div>\
<div class="asw-rg asw-rg-bottom" style="top: auto;bottom: 0;"></div>';
          let topEl = a.querySelector(".asw-rg-top"),
              btmEl = a.querySelector(".asw-rg-bottom"),
              pad = 20;
          window.onScrollReadableGuide = function(s) {
            topEl.style.height = s.clientY - pad + "px";
            btmEl.style.height = window.innerHeight - s.clientY - pad - pad + "px";
          };
          document.addEventListener("mousemove", window.onScrollReadableGuide, { passive: false });
          document.body.appendChild(a);
        }
      } else {
        rg && (rg.remove(), document.removeEventListener("mousemove", window.onScrollReadableGuide));
      }

      if (this.settings.states["stop-animations"]) {
        css += `
body * {
  ${this.getFilterCSS("none !important", "transition")}
  ${this.getFilterCSS("forwards !important", "animation-fill-mode")}
  ${this.getFilterCSS("1 !important", " animation-iteration-count")}
  ${this.getFilterCSS(".01s !important", "animation-duration")}
}
`;
      }

      if (this.settings.states["big-cursor"]) {
        css += `
body * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 512 512'%3E%3Cpath  d='M429.742 319.31L82.49 0l-.231 471.744 105.375-100.826 61.89 141.083 96.559-42.358-61.89-141.083 145.549-9.25zM306.563 454.222l-41.62 18.259-67.066-152.879-85.589 81.894.164-333.193 245.264 225.529-118.219 7.512 67.066 152.878z' xmlns='http://www.w3.org/2000/svg'/%3E%3C/svg%3E") ,default !important;
}
`;
      }

      if (this.settings.states["readable-font"]) {
        css += `
@font-face {
  font-family: OpenDyslexic3;
  src: url("https://website-widgets.pages.dev/fonts/OpenDyslexic3-Regular.woff") format("woff"),
       url("https://website-widgets.pages.dev/fonts/OpenDyslexic3-Regular.ttf") format("truetype");
}
`;
      }

      this.addStyleSheet(css, "asw-content-style");
    }

    addStyleSheet(css, id) {
      let el = document.getElementById(id || "") || document.createElement("style");
      el.innerHTML = css;
      if (!el.id) { el.id = id; document.head.appendChild(el); }
    }

    getFilterCSS(val, prop) {
      let out = "", vendors = ["-o-","-ms-","-moz-","-webkit",""];
      for (let n = vendors.length; n--; ) out += vendors[n] + (prop || "filter") + ":" + val + ";";
      return out;
    }

    translate() {
      if (!this.menu) return;
      this.menu.querySelectorAll("[title]").forEach(el=>{
        let k = el.getAttribute("data-translate");
        if (!k) { k = el.getAttribute("title"); el.setAttribute("data-translate", k); }
        k = this.locale?.[k] || k;
        el.setAttribute("title", k);
      });
      this.menu.querySelector(".asw-amount").innerHTML =
        (this.settings.states.fontSize && this.settings.states.fontSize !== 1)
        ? `${parseInt(100 * this.settings.states.fontSize)}%`
        : (this.locale?.Default || "Default");

      this.menu.querySelectorAll(".asw-card-title, .asw-translate").forEach(el=>{
        let k = el.getAttribute("data-translate");
        if (!k) { k = String(el.innerText || "").trim(); el.setAttribute("data-translate", k); }
        k = this.locale?.[k] || k;
        el.innerText = k;
      });
    }

    // ---------- UPDATED: ใส่ theme-* ที่ <html> ตามโหมด ----------
    changeFilter(mode) {
      let css = "";
      // map โหมด → theme class
      let theme = null;
      if (mode === 'light-contrast') theme = 'theme-light';
      else if (mode === 'dark-contrast') theme = 'theme-dark';
      else if (mode === 'yellow-contrast') theme = 'theme-hc';
      // โหมดอื่น ๆ ไม่ตั้ง theme

      if (mode) {
        let s = "";
        if      (mode === "light-contrast")  s = " color: #000 !important;fill: #000 !important;background-color: #FFF !important;";
        else if (mode === "high-contrast")   s = " filter: contrast(125%);";
        else if (mode === "high-saturation") s += this.getFilterCSS("saturate(200%)");
        else if (mode === "low-saturation")  s += this.getFilterCSS("saturate(50%)");
        else if (mode === "monochrome")      s += this.getFilterCSS("grayscale(100%)");

        let scope = [""];
        if (mode === "high-contrast" || mode === "light-contrast") scope = ["html"];
        for (let i = scope.length; i--; ) css += `[data-asw-filter="${mode}"] ${scope[i]}{${s}}`;
      }

      this.addStyleSheet(css, "asw-filter-style");
      if (mode) document.documentElement.setAttribute("data-asw-filter", mode);
      else document.documentElement.removeAttribute("data-asw-filter");

      // ใส่/ล้างคลาสธีมที่ <html>
      this.setThemeClass(theme);
    }

    _createButtons(arr, extraClass) {
      let html = "";
      for (let i = arr.length; i--; ) {
        const n = arr[i];
        let active = this.settings.states[n.key];
        if (extraClass === "asw-filter" && this.settings.states.contrast === n.key) active = true;
        html += `
<button class="asw-btn ${extraClass || ""} ${active ? "asw-selected" : ""}" type="button" data-key="${n.key}" title="${n.label}">
  <span class="material-icons">${n.icon}</span>
  <span class="asw-translate">${n.label}</span>
</button>`;
      }
      return html;
    }
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    let widgetInstance, root = document.createElement("div");
    root.innerHTML = '<div class="asw-widget -mb"><a href="javascript:void(0);" class="asw-menu-btn-mobile active" title="เมนูสำหรับผู้พิการ" role="button" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30px" height="30px"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg></a></div>';

    // โหลดจาก cookie (asw=...)
    let ck = (function() {
      let name = "asw=", parts = decodeURIComponent(document.cookie).split(";");
      for (let i = 0; i < parts.length; i++) {
        let s = parts[i];
        while (s.charAt(0) === " ") s = s.substring(1);
        if (s.indexOf(name) === 0) return s.substring(name.length, s.length);
      }
      return "";
    })();
    if (ck) { try { ck = JSON.parse(ck); } catch (e) {} }

    if (ck?.states) {
      widgetInstance = new AccessibilityWidget({ container: root, settings: ck });
    }

    // แสดงเมนูทันที
    widgetInstance = new AccessibilityWidget({ container: root }).render();
    document.body.appendChild(root);
  });
})();

$(window).on('load', function() {
  $(".asw-widget a").removeClass("active");

  $(".asw-widget").click(function() {
    $(".asw-widget a").addClass('active');
    $(".asw-wrapper").addClass("active");
  });
  $(".asw-menu-btn-mobile").click(function() {
    $(this).addClass('active');
    $(".asw-wrapper").addClass("active");
    $(".asw-widget ~ div").addClass("bg-asw-popup");
  });
  $(".asw-menu-close").click(function() {
    $(".asw-widget a").removeClass("active");
    $(".asw-wrapper").removeClass("active");
    $(".asw-widget ~ div").removeClass("bg-asw-popup");
  });
});

