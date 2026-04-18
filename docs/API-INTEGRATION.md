# API Entegrasyonları

- **OpenAI / LLM**: Özet üretimi ve chat yanıtı.
- **VLM API**: Görsel içerik analizi.
- **OCR API**: PDF/PPTX içinden metin çıkarımı.
- **RAG API**: Embedding verisini saklama/indeksleme.
- **OpenWebUI**: Chat giriş/çıkış entegrasyonu.

Her workflow içindeki `HTTP Request` node'larında:
- `Authorization: Bearer {{$env.<KEY>}}` formatı kullanılır.
- URL alanı ilgili servis endpoint'i ile değiştirilir.
