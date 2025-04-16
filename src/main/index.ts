import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'  // fs モジュールを追加
import path from 'path'  // path モジュールを追加
// アセットインポートの型宣言を追加
// @ts-ignore - asset importのための型エラーを無視
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1068,
    //transparent: true,
    //frame: true,
    // show: false,   
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 23, y: 23 }, 
    //backgroundMaterial: 'acrylic',
    //toolbar: true,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // メインウィンドウが読み込まれた後にCSSを注入
  mainWindow.webContents.on('did-finish-load', () => {
    // macOSの場合のみCSSを注入
    if (process.platform === 'darwin') {
      mainWindow.webContents.insertCSS(`
        /* macOS信号機ボタンの位置調整 */
        .titlebar-controls-container {
          padding-top: 20px !important; /* 数値を調整して位置を下げる */
        }
        /* または */
        :root {
          --traffic-light-offset: 20px; /* 必要に応じて調整 */
        }
      `);
    }
    
    // デバッグモードの場合は開発者ツールを自動的に開く
    if (isDebug) {
      debugLog('Opening DevTools automatically (debug mode)');
      mainWindow.webContents.openDevTools();
    }
    
    // レンダラープロセスにメッセージを送信
    mainWindow.webContents.send('main-process-ready', { 
      timestamp: new Date().toISOString(),
      pid: process.pid,
      electronVersion: process.versions.electron
    });
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': [
  //         "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  //       ]
  //     }
  //   })
  // })
}

// デバッグモードの設定
const isDebug = process.env.NODE_ENV === 'development' || process.argv.includes('--debug');

// デバッグログ関数
function debugLog(...args: any[]) {
  if (isDebug) {
    console.log('[Main Process Debug]', ...args);
  }
}

// preloadスクリプトからの準備完了メッセージを受信
ipcMain.on('preload-ready', (_, data) => {
  debugLog('Preload script is ready:', data);
});

// ファイル存在確認ハンドラ (改善版)
ipcMain.handle('verify-file-exists', async (_, filePath) => {
  debugLog(`Verifying file exists: ${filePath}`);
  
  try {
    // パスが提供されているか確認
    if (!filePath) {
      debugLog('No file path provided');
      return {
        exists: false,
        path: filePath,
        error: 'ファイルパスが指定されていません'
      };
    }

    // パスを正規化して存在チェック
    const normalizedPath = path.normalize(filePath);
    debugLog(`Normalized path: ${normalizedPath}`);
    
    const exists = fs.existsSync(normalizedPath);
    debugLog(`File ${normalizedPath} exists: ${exists}`);
    
    if (exists) {
      // ファイルの詳細情報を取得
      const stats = fs.statSync(normalizedPath);
      debugLog(`File stats: isFile=${stats.isFile()}, size=${stats.size}, modified=${stats.mtime}`);
      
      return {
        exists: true,
        path: normalizedPath,
        isFile: stats.isFile(),
        size: stats.size,
        lastModified: stats.mtime
      };
    }
    
    return {
      exists: false,
      path: normalizedPath
    };
  } catch (error) {
    debugLog('Error verifying file:', error);
    return {
      exists: false,
      path: filePath,
      error: error instanceof Error ? error.message : 'ファイルの確認中にエラーが発生しました'
    };
  }
});

// PDFファイル読み込みハンドラ (改善版)
ipcMain.handle('read-pdf-file', async (_, filePath) => {
  debugLog(`Reading PDF file: ${filePath}`);
  
  try {
    // パスが提供されているか確認
    if (!filePath) {
      debugLog('No file path provided');
      return {
        success: false,
        error: 'ファイルパスが指定されていません'
      };
    }

    // パスを正規化
    const normalizedPath = path.normalize(filePath);
    debugLog(`Normalized path: ${normalizedPath}`);
    
    // ファイルの存在確認
    if (!fs.existsSync(normalizedPath)) {
      debugLog(`File not found: ${normalizedPath}`);
      return {
        success: false,
        error: `ファイルが見つかりません: ${normalizedPath}`
      };
    }

    // ファイルの状態確認
    const stats = fs.statSync(normalizedPath);
    if (!stats.isFile()) {
      debugLog(`Not a file: ${normalizedPath}`);
      return {
        success: false,
        error: `指定されたパスはファイルではありません: ${normalizedPath}`
      };
    }

    debugLog(`Reading file: ${normalizedPath}, size: ${stats.size} bytes`);
    
    // ファイル読み込み（バイナリデータとして）
    const fileBuffer = await fs.promises.readFile(normalizedPath);
    debugLog(`Successfully read file: ${normalizedPath}, buffer size: ${fileBuffer.length} bytes`);

    // Base64エンコードしてレンダラープロセスに返す
    return {
      success: true,
      data: fileBuffer.toString('base64'),
      name: path.basename(normalizedPath),
      size: fileBuffer.length,
      lastModified: stats.mtime
    };
  } catch (error) {
    debugLog('Error reading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました'
    };
  }
});

// 開発者ツールを開くためのIPCハンドラ
ipcMain.on('open-devtools', (event) => {
  const webContents = event.sender;
  if (webContents) {
    debugLog('Opening DevTools');
    webContents.openDevTools();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.