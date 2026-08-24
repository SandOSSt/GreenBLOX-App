import type { NextConfig } from "next";

/**
 * GreenBlox Studio доступен друзьям и с любого локального IP (Wi-Fi, Radmin VPN,
 * виртуальные адаптеры VMware). Начиная с Next 15.4 dev-сервер блокирует
 * HMR-WebSocket для origin-ов вне списка allowedDevOrigins (защита от CVE —
 * cross-site WebSocket hijacking), что вешало студию на сплэше при открытии
 * по LAN-IP. Разрешаем любые IPv4 и .local-хосты в dev (на прод-сборку не влияет).
 */
const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.*.*.*", "*.local", "localhost", "*.localhost"],
};

export default nextConfig;
