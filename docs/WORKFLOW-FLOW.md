# Veri Akışı

1. Veri `1-data-input` webhook'una gelir.
2. Dosya işleme için `2-pdf-pptx-processor` kullanılır.
3. Görseller `3-vlm-agent` ile analiz edilir.
4. Metin çıkarımı `4-ocr-agent` ile yapılır.
5. Çıkan içerik `5-llm-summary` ile özetlenir.
6. Özet ve içerik `6-rag-embedding` ile embedding akışına gider.
7. Sonuçlar `7-chat-agent` ile OpenWebUI tarafına servis edilir.
