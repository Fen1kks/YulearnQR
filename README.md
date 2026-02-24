<img src="assets/icons/icon.svg" align="right" width="60">

# Yulearn QR Yoklama Tarayıcı

Yeditepe Üniversitesi öğrencileri için geliştirilmiş, Yulearn QR yoklama kodlarını hızlı ve güvenli şekilde tarayan bir **Progressive Web App (PWA)**.

## 🚀 Canlı Demo

Projeyi hemen dene: [Yulearn QR](https://fen1kks.github.io/YulearnQR/)

## ✨ Özellikler

- 📸 **Hızlı QR Tarama** — html5-qrcode ile anlık tarama
- 🔒 **Güvenli Doğrulama** — Sadece `yulearn.yeditepe.edu.tr` bağlantıları kabul edilir
- 🌐 **Çoklu Dil** — Türkçe ve İngilizce arayüz
- 📱 **PWA** — Ana ekrana eklenebilir, native uygulama deneyimi
- 📝 **Tarama Geçmişi** — Son 5 tarama kaydedilir

## 🚀 Kurulum

### Geliştirme Sunucusu

Kamera API'si HTTPS gerektirir. Yerel geliştirme için:

```bash
# SSL sertifikaları oluştur (bir kerelik)
openssl req -x509 -newkey rsa:2048 -keyout cert.key -out cert.crt -days 365 -nodes -subj "/CN=localhost"

# HTTPS sunucusu başlat
npx -y http-server . -p 8080 -c-1 -S -C cert.crt -K cert.key
```

Tarayıcıda `https://localhost:8080` adresini aç.

### GitHub Pages

Proje doğrudan GitHub Pages'e deploy edilebilir — build adımı gerekmez.

## 📁 Proje Yapısı

```
YulearnQR/
├── index.html              # Ana sayfa
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (cache)
├── css/style.css           # Stiller
├── js/
│   ├── app.js              # Orkestratör
│   ├── scanner.js          # QR tarayıcı
│   ├── validator.js        # URL doğrulama
│   ├── i18n.js             # Çoklu dil (TR/EN)
│   ├── utils/
│   │   └── dom.js          # DOM yardımcıları ($, el, show/hide, delegate)
│   ├── ui/
│   │   ├── status.js       # Durum kartı & toast
│   │   ├── history.js      # Tarama geçmişi (FIFO, max 7)
│   │   └── redirect.js     # Yönlendirme overlay
│   └── vendor/
│       └── html5-qrcode.min.js
└── assets/icons/icon.svg
```

## 🛠️ Teknolojiler

- **HTML5 / CSS3 / Vanilla JS** — Sıfır framework
- **ES Modules** — Modüler yapı
- **html5-qrcode** — QR tarama kütüphanesi
- **PWA** — Manifest + Service Worker

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**