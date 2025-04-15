import React, { useState, useEffect } from 'react';
import styles from './PDFViewer.module.css';
import PDFCacheManager from '../utils/PDFCacheManager';

interface PDFViewerProps {
  src: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ src, title }) => {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState(title || '');
  const cacheManager = PDFCacheManager.getInstance();

  // APIが利用可能かどうかを確認する関数
  const checkAPIAvailability = () => {
    if (!window.api) {
      console.error('window.api is not available');
      return false;
    }
    
    if (!window.api.pdf) {
      console.error('window.api.pdf is not available');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // まずキャッシュを確認
        if (cacheManager.hasPDF(src)) {
          console.log(`Loading PDF from cache: ${src}`);
          const cachedPdf = cacheManager.getPDF(src);
          
          if (cachedPdf) {
            setPdfData(`data:application/pdf;base64,${cachedPdf.data}`);
            setFileName(cachedPdf.name || fileName);
            setIsLoading(false);
            return;
          }
        }

        // キャッシュになければAPIが利用可能かを確認
        if (!checkAPIAvailability()) {
          setError('PDF APIが利用できません。preloadスクリプトを確認してください。');
          setIsLoading(false);
          return;
        }

        console.log('Checking if file exists:', src);
        
        // 型アサーションを使用して、APIが存在することを保証
        const fileCheck = await (window.api.pdf!.verifyExists(src));
        console.log('File check result:', fileCheck);
        
        if (!fileCheck.exists) {
          setError(`ファイルが見つかりません: ${src}`);
          setIsLoading(false);
          return;
        }

        console.log('Reading PDF file:', src);
        
        // PDFファイルをBase64エンコードされたデータとして読み込む
        const result = await (window.api.pdf!.readFile(src));
        console.log('PDF read result:', { success: result.success, hasData: !!result.data });
        
        if (result.success && result.data) {
          // キャッシュに保存
          cacheManager.setPDF(
            src, 
            result.data, 
            result.name || fileName,
            result.size || 0
          );
          
          // Base64エンコードされたデータをセット
          setPdfData(`data:application/pdf;base64,${result.data}`);
          if (result.name) {
            setFileName(result.name);
          }
        } else {
          setError(result.error || 'PDFファイルの読み込みに失敗しました');
        }
      } catch (error) {
        console.error('PDF loading error:', error);
        setError('PDFの読み込み中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (src) {
      loadPdf();
    }
    
    // キャッシュの状態をログに出力
    const stats = cacheManager.getStats();
    console.log(`Cache stats: ${stats.count} PDFs, ${Math.round(stats.totalSize / 1024 / 1024 * 100) / 100} MB total`);
    
  }, [src]);
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>PDFを読み込み中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>PDFの読み込みエラー</h3>
        <p>{error}</p>
        <div>
          <p>トラブルシューティング:</p>
          <ul>
            <li>preloadスクリプトでAPI設定を確認</li>
            <li>メインプロセスでIPCハンドラが登録されていることを確認</li>
            <li>パスが正しいか確認 (現在のパス: {src})</li>
            <li>開発者ツールを開いてコンソールを確認</li>
          </ul>
          <button onClick={() => {
            console.log('window.api:', window.api);
            console.log('window.api.pdf:', window.api?.pdf);
            console.log('Cache stats:', cacheManager.getStats());
          }}>
            デバッグ情報を表示
          </button>
        </div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className={styles.errorContainer}>
        <p>PDFデータが読み込まれていません</p>
      </div>
    );
  }
  
  return (
    <div className={styles.pdfViewer}>
      <div className={styles.pdfHeader}>
        <h2>{title || fileName}</h2>
        <div className={styles.pdfControls}>
          <button>表示サイズ +</button>
          <button>表示サイズ -</button>
          <button>全画面表示</button>
          <button onClick={() => {
            cacheManager.removePDF(src);
            console.log(`Removed ${src} from cache`);
          }}>
            キャッシュ削除
          </button>
        </div>
      </div>
      
      <div className={styles.pdfContent}>
        <iframe 
          src={`${pdfData}#toolbar=1&navpanes=1`} 
          title={title || fileName} 
          width="100%" 
          height="100%" 
          className={styles.pdfIframe} 
        />
      </div>
    </div>
  );
};

export default React.memo(PDFViewer);