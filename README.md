<img src="assets/icons/icon.svg" align="right" width="60">

# Yulearn QR Yoklama Tarayıcı

Yeditepe Üniversitesi öğrencileri için geliştirilmiş, Yulearn QR yoklama kodlarını hızlı ve güvenli şekilde tarayan bir **Progressive Web App (PWA)**.

## 🚀 Canlı Demo

Projeyi hemen dene: [Yulearn QR](https://fen1kks.github.io/YulearnQR/)

## ✨ Özellikler

- 📸 **Hızlı QR Tarama** — qr-scanner (nimiq) ile anlık tarama
- 🔍 **Hibrit Zoom** — Android'de optik zoom, iOS'te dijital zoom + pinch-to-zoom
- 🔒 **Güvenli Doğrulama** — Sadece `yulearn.yeditepe.edu.tr` bağlantıları kabul edilir
- 🌐 **Çoklu Dil** — Türkçe ve İngilizce arayüz
- 📱 **PWA** — Ana ekrana eklenebilir, native uygulama deneyimi
- 📝 **Tarama Geçmişi** — Son 6 tarama kaydedilir
- ⚙️ **Ayarlar** — Titreşim (haptic) ve anında yönlendirme seçenekleri

## 🚀 Kurulum

### Geliştirme Sunucusu

Kamera API'si HTTPS gerektirir. Yerel geliştirme için:

```bash
# SSL sertifikaları oluştur (bir kerelik)
npx -y mkcert create-ca
npx -y mkcert create-cert

# HTTPS sunucusu başlat
npx -y http-server . -p 8080 -c-1 -S -C cert.crt -K cert.key
```

Tarayıcıda `https://localhost:8080` adresini aç. Telefondan test için `https://<IP_ADRESIN>:8080` kullan.

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
│   ├── scanner.js          # QR tarayıcı (qr-scanner)
│   ├── zoom-controller.js  # Hibrit zoom motoru (HW/SW)
│   ├── validator.js        # URL doğrulama
│   ├── i18n.js             # Çoklu dil (TR/EN)
│   ├── utils/
│   │   └── dom.js          # DOM yardımcıları ($, el, show/hide, delegate)
│   ├── ui/
│   │   ├── status.js       # Durum kartı & toast
│   │   ├── history.js      # Tarama geçmişi (FIFO, max 6)
│   │   ├── redirect.js     # Yönlendirme overlay
│   │   └── settings.js     # Ayarlar modalı
│   └── vendor/
│       ├── qr-scanner.min.js
│       └── qr-scanner-worker.min.js
└── assets/icons/icon.svg
```

## 🛠️ Teknolojiler

- **HTML5 / CSS3 / Vanilla JS** — Sıfır framework
- **ES Modules** — Modüler yapı
- **qr-scanner** (nimiq) — QR tarama kütüphanesi
- **PWA** — Manifest + Service Worker

## 📄 Lisans

MIT License — detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**