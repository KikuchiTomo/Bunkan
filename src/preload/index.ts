import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// デバッグログを追加
const isDebug = true;

function debugLog(...args: any[]) {
  if (isDebug) {
    console.log('[Preload Debug]', ...args);
  }
}

debugLog('Preload script starting');

// PDF関連のAPI
const pdfAPI = {
  readFile: (filePath: string) => {
    debugLog('Called readFile with path:', filePath);
    return ipcRenderer.invoke('read-pdf-file', filePath);
  },
  verifyExists: (filePath: string) => {
    debugLog('Called verifyExists with path:', filePath);
    return ipcRenderer.invoke('verify-file-exists', filePath);
  }
};

// Custom APIs for renderer
const api = {
  // PDFプロパティをapiオブジェクトに追加
  pdf: pdfAPI
};

// APIオブジェクトの内容をログ出力
debugLog('API object structure:', JSON.stringify({
  hasApi: true,
  hasPdf: !!api.pdf,
  pdfMethods: Object.keys(api.pdf || {})
}));

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    debugLog('Context isolation is enabled, exposing APIs via contextBridge');
    
    // electronAPI
    contextBridge.exposeInMainWorld('electron', electronAPI);
    debugLog('Exposed electron API');
    
    // カスタムAPI
    contextBridge.exposeInMainWorld('api', api);
    debugLog('Exposed custom API');
    
    // テスト用API - これが見えるなら公開は成功している
    contextBridge.exposeInMainWorld('preloadTest', {
      ping: () => 'pong',
      getTime: () => new Date().toISOString()
    });
    
    debugLog('All APIs exposed successfully');
  } catch (error) {
    console.error('Failed to expose APIs:', error);
  }
} else {
  debugLog('Context isolation is disabled, adding APIs to window object directly');
  
  // コンテキスト分離が無効の場合はwindowオブジェクトに直接追加
  // @ts-ignore (window拡張のための型エラーを無視)
  window.electron = electronAPI;
  // @ts-ignore
  window.api = api;
  
  debugLog('APIs added to window object directly');
}

debugLog('Preload script completed');

// テストのためのIPCイベント送信
ipcRenderer.send('preload-ready', { timestamp: new Date().toISOString() });