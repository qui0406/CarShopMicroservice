-- =============================================================
-- Seed data: fee_config
-- Chạy 1 lần sau khi đã tạo bảng (ddl-auto: update sẽ tự tạo)
-- Hoặc đặt vào Flyway migration: V2__seed_fee_config.sql
-- =============================================================

-- Xóa dữ liệu cũ (an toàn khi chạy lại)
DELETE FROM fee_config;

-- ---------------------------------------------------------------
-- 1. Thuế trước bạ (REGISTRATION_TAX_RATE)
--    Lưu dưới dạng tỉ lệ thập phân: 0.12 = 12%, 0.10 = 10%
--    Xe điện: miễn thuế (xử lý trong code, không cần row)
-- ---------------------------------------------------------------
INSERT INTO fee_config (fee_key, value, region, fuel_type, description, active)
VALUES
    ('REGISTRATION_TAX_RATE', 0.1200, 'HANOI', 'ALL',
     'Thuế trước bạ Hà Nội (12%) - áp dụng xe xăng/dầu/hybrid', TRUE),

    ('REGISTRATION_TAX_RATE', 0.1200, 'HCM',   'ALL',
     'Thuế trước bạ TP.HCM (12%) - áp dụng xe xăng/dầu/hybrid', TRUE),

    ('REGISTRATION_TAX_RATE', 0.1000, 'OTHER',  'ALL',
     'Thuế trước bạ tỉnh/thành khác (10%)', TRUE);

-- ---------------------------------------------------------------
-- 2. Phí biển số (PLATE_FEE)
--    Hà Nội & HCM: 20.000.000 VNĐ  |  Tỉnh khác: 1.000.000 VNĐ
-- ---------------------------------------------------------------
INSERT INTO fee_config (fee_key, value, region, fuel_type, description, active)
VALUES
    ('PLATE_FEE', 20000000, 'HANOI', 'ALL',
     'Phí cấp biển số Hà Nội', TRUE),

    ('PLATE_FEE', 20000000, 'HCM',   'ALL',
     'Phí cấp biển số TP.HCM', TRUE),

    ('PLATE_FEE',  1000000, 'OTHER',  'ALL',
     'Phí cấp biển số tỉnh/thành khác', TRUE);

-- ---------------------------------------------------------------
-- 3. Phí đăng kiểm (INSPECTION_FEE)
--    Áp dụng toàn quốc, không phân biệt vùng -> region = ALL
-- ---------------------------------------------------------------
INSERT INTO fee_config (fee_key, value, region, fuel_type, description, active)
VALUES
    ('INSPECTION_FEE', 2500000, 'ALL', 'ALL',
     'Phí đăng kiểm lần đầu toàn quốc', TRUE);
