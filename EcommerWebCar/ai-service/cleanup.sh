#!/usr/bin/env bash
# ============================================================
# cleanup.sh — Dọn dẹp files cũ sau khi tái cấu trúc thư mục
# Chạy từ thư mục root: bash cleanup.sh
# ============================================================

set -e
ROOT="$(pwd)"

echo "=== BƯỚC 1: Đổi tên model/ → models/ ==="
if [ -d "$ROOT/model" ] && [ ! -d "$ROOT/models" ]; then
    mv "$ROOT/model" "$ROOT/models"
    echo "  ✅ model/ → models/"
elif [ -d "$ROOT/model" ] && [ -d "$ROOT/models" ]; then
    # Nếu models/ đã tồn tại, gộp nội dung
    cp -r "$ROOT/model/." "$ROOT/models/"
    rm -rf "$ROOT/model"
    echo "  ✅ Gộp model/ vào models/"
else
    echo "  ⏭  models/ đã tồn tại, bỏ qua"
fi

echo ""
echo "=== BƯỚC 2: Di chuyển .pt weights vào models/ ==="
PT_FILES=("yolo_car_damage_best.pt" "yolov8n.pt")
for pt in "${PT_FILES[@]}"; do
    SRC="$ROOT/researchers/experiments/$pt"
    DST="$ROOT/models/$pt"
    if [ -f "$SRC" ]; then
        mv "$SRC" "$DST"
        echo "  ✅ researchers/experiments/$pt → models/$pt"
    else
        echo "  ⏭  $pt không tìm thấy, bỏ qua"
    fi
done

echo ""
echo "=== BƯỚC 3: Tạo scripts/ từ researchers/data_processing/ ==="
if [ -d "$ROOT/researchers/data_processing" ]; then
    mkdir -p "$ROOT/scripts"
    cp -r "$ROOT/researchers/data_processing/." "$ROOT/scripts/"
    echo "  ✅ researchers/data_processing/ → scripts/"
fi

echo ""
echo "=== BƯỚC 4: Tạo notebooks/ từ researchers/training/ ==="
if [ -d "$ROOT/researchers/training" ]; then
    mkdir -p "$ROOT/notebooks"
    cp -r "$ROOT/researchers/training/." "$ROOT/notebooks/"
    echo "  ✅ researchers/training/ → notebooks/"
fi

echo ""
echo "=== BƯỚC 5: Gộp database/ vào root (xóa src/database/ trùng) ==="
if [ -d "$ROOT/src/database" ]; then
    if [ -f "$ROOT/src/database/sql_schema.sql" ]; then
        mkdir -p "$ROOT/database"
        cp "$ROOT/src/database/sql_schema.sql" "$ROOT/database/sql_schema.sql"
        echo "  ✅ sql_schema.sql → database/"
    fi
    rm -rf "$ROOT/src/database"
    echo "  ✅ Xóa src/database/ trùng lặp"
fi

echo ""
echo "=== BƯỚC 6: Xóa files cũ trong researchers/experiments/ ==="
OLD_FILES=(
    "car_classifier.py"
    "damage_detector.py"
    "image_validator.py"
    "model_loader.py"
    "price_service.py"
    "valuation_service.py"
    "utils.py"
    "test_retrieval.py"
)
for f in "${OLD_FILES[@]}"; do
    TARGET="$ROOT/researchers/experiments/$f"
    if [ -f "$TARGET" ]; then
        rm "$TARGET"
        echo "  ✅ Xóa researchers/experiments/$f"
    fi
done

echo ""
echo "=== BƯỚC 7: Xóa src/car_variants.py cũ ==="
if [ -f "$ROOT/src/car_variants.py" ]; then
    rm "$ROOT/src/car_variants.py"
    echo "  ✅ Xóa src/car_variants.py cũ"
fi

echo ""
echo "=== BƯỚC 8: Xóa thư mục pycache ==="
find "$ROOT" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
echo "  ✅ Đã xóa __pycache__"

echo ""
echo "=== BƯỚC 9: Xóa thư mục researchers/ nếu rỗng ==="
if [ -d "$ROOT/researchers/experiments" ]; then
    REMAINING=$(find "$ROOT/researchers/experiments" -type f 2>/dev/null | grep -v '__pycache__' | wc -l)
    if [ "$REMAINING" -eq 0 ]; then
        rm -rf "$ROOT/researchers"
        echo "  ✅ Đã xóa thư mục researchers/ (đã rỗng)"
    else
        echo "  ⚠️  researchers/experiments/ còn $REMAINING file, giữ lại để kiểm tra"
    fi
fi

echo ""
echo "✅ Hoàn tất dọn dẹp! Cấu trúc mới:"
echo ""
echo "chatbot-service/"
echo "├── src/"
echo "│   ├── main.py"
echo "│   ├── core/         (agent, rag_engine, config, context)"
echo "│   ├── services/     (car_classifier, model_loader, damage_detector, ...)"
echo "│   └── utils/        (db_utils, card_helper, logger, analysis, car_variants)"
echo "├── models/           (car_price_model.keras, yolo*.pt, transformers/)"
echo "├── data/             (raw/, processed/, chatbot/, info/)"
echo "├── database/         (sql_schema.sql, vector_db/)"
echo "├── scripts/          (scraping & preprocessing scripts)"
echo "└── notebooks/        (training experiments)"
