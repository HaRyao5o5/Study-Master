// src/utils/security.ts

/**
 * ユーザーのパブリックIPアドレスを取得する
 */
async function getPublicIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get public IP:', error);
    return '';
  }
}

/**
 * 現在のプロパティが管理者として許可されたIPかどうかを検証する
 */
export async function checkAdminIp(): Promise<boolean> {
  const allowedIpsStr = import.meta.env.VITE_ADMIN_ALLOWED_IPS || '';
  if (!allowedIpsStr) return true; // 設定がない場合はパス（開発初期用）

  const allowedIps = allowedIpsStr.split(',').map((ip: string) => ip.trim());
  const currentIp = await getPublicIp();
  
  return allowedIps.includes(currentIp);
}
