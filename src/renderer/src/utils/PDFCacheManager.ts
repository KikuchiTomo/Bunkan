// PDFデータをキャッシュするためのマネージャー
type PDFCacheItem = {
	data: string;
	name: string;
	timestamp: number;
	size: number;
  };
  
  class PDFCacheManager {
	private static instance: PDFCacheManager;
	private cache: Map<string, PDFCacheItem> = new Map();
	private maxCacheSize: number = 20; // キャッシュするPDFの最大数
	private maxIdleTime: number = 30 * 60 * 1000; // キャッシュの最大アイドル時間 (30分)
  
	private constructor() {
	  // 定期的にキャッシュをクリーンアップ
	  setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // 5分ごとにクリーンアップ
	}
  
	public static getInstance(): PDFCacheManager {
	  if (!PDFCacheManager.instance) {
		PDFCacheManager.instance = new PDFCacheManager();
	  }
	  return PDFCacheManager.instance;
	}
  
	/**
	 * PDFをキャッシュに保存
	 */
	public setPDF(path: string, data: string, name: string, size: number): void {
	  console.log(`Caching PDF: ${path}, size: ${size} bytes`);
	  
	  // キャッシュが最大サイズを超えた場合、最も古いエントリを削除
	  if (this.cache.size >= this.maxCacheSize) {
		this.removeOldestEntry();
	  }
  
	  this.cache.set(path, {
		data,
		name,
		timestamp: Date.now(),
		size
	  });
	}
  
	/**
	 * キャッシュからPDFを取得
	 */
	public getPDF(path: string): PDFCacheItem | null {
	  const cacheItem = this.cache.get(path);
	  
	  if (cacheItem) {
		// アクセス時にタイムスタンプを更新
		cacheItem.timestamp = Date.now();
		console.log(`Cache hit for PDF: ${path}`);
		return cacheItem;
	  }
	  
	  console.log(`Cache miss for PDF: ${path}`);
	  return null;
	}
  
	/**
	 * PDFがキャッシュにあるか確認
	 */
	public hasPDF(path: string): boolean {
	  return this.cache.has(path);
	}
  
	/**
	 * キャッシュからPDFを削除
	 */
	public removePDF(path: string): void {
	  this.cache.delete(path);
	}
  
	/**
	 * キャッシュをクリア
	 */
	public clearCache(): void {
	  this.cache.clear();
	}
  
	/**
	 * 最も古いキャッシュエントリを削除
	 */
	private removeOldestEntry(): void {
	  let oldestKey: string | null = null;
	  let oldestTime = Date.now();
  
	  for (const [key, item] of this.cache.entries()) {
		if (item.timestamp < oldestTime) {
		  oldestTime = item.timestamp;
		  oldestKey = key;
		}
	  }
  
	  if (oldestKey) {
		console.log(`Removing oldest cache entry: ${oldestKey}`);
		this.cache.delete(oldestKey);
	  }
	}
  
	/**
	 * 古いキャッシュエントリをクリーンアップ
	 */
	private cleanupCache(): void {
	  const now = Date.now();
	  
	  for (const [key, item] of this.cache.entries()) {
		// アイドル時間が最大値を超えたエントリを削除
		if (now - item.timestamp > this.maxIdleTime) {
		  console.log(`Cleaning up idle cache entry: ${key}`);
		  this.cache.delete(key);
		}
	  }
	}
  
	/**
	 * キャッシュの統計情報を取得
	 */
	public getStats(): {count: number, totalSize: number} {
	  let totalSize = 0;
	  
	  for (const item of this.cache.values()) {
		totalSize += item.size;
	  }
	  
	  return {
		count: this.cache.size,
		totalSize
	  };
	}
  }
  
  export default PDFCacheManager;