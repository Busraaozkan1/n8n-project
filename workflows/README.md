# Workflow Şablonlar

1. `1-data-input.json` - Webhook ile veri girişini alır.
2. `2-pdf-pptx-processor.json` - PDF/PPTX dosya URL bilgisini işler.
3. `3-vlm-agent.json` - Görsel analiz için VLM API çağrısı şablonu.
4. `4-ocr-agent.json` - OCR API çağrısı ile metin çıkarımı.
5. `5-llm-summary.json` - LLM ile özet üretimi.
6. `6-rag-embedding.json` - Embedding üretimi ve RAG servisine gönderim.
7. `7-chat-agent.json` - OpenWebUI isteklerini alıp yanıt döner.
