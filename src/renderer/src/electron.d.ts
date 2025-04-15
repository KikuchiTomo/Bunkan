// src/renderer/src/electron.d.ts

/**
 * ElectronのAPIとカスタムAPIの型定義
 */

// Electronのデフォルト型定義（@electron-toolkit/preloadから提供される）
interface ElectronAPI {
	ipcRenderer: {
	  send(channel: string, ...args: any[]): void;
	  on(channel: string, listener: (event: any, ...args: any[]) => void): void;
	  once(channel: string, listener: (event: any, ...args: any[]) => void): void;
	  removeListener(channel: string, listener: (event: any, ...args: any[]) => void): void;
	};
	// その他、@electron-toolkit/preloadから提供される型定義
  }
  
  // PDFファイル関連のAPI型定義
  interface PDFResult {
	success: boolean;
	data?: string;
	name?: string;
	error?: string;
	size?: number;              // sizeプロパティを追加
	lastModified?: Date;        // lastModifiedプロパティを追加
  }
  
  interface FileVerifyResult {
	exists: boolean;
	path: string;
	error?: string;
	isFile?: boolean;          // isFileプロパティを追加
	size?: number;             // sizeプロパティを追加
	lastModified?: Date;       // lastModifiedプロパティを追加
  }
  
  // 独自に追加するAPI型定義
  interface API {
	pdf?: {
	  readFile: (filePath: string) => Promise<PDFResult>;
	  verifyExists: (filePath: string) => Promise<FileVerifyResult>;
	};
  }
  
  // グローバルWindow型の拡張
  declare global {
	interface Window {
	  electron: ElectronAPI;
	  api: API;
	  preloadTest?: {           // テスト用API
		ping: () => string;
		getTime: () => string;
	  };
	}
  }
  
  export {};