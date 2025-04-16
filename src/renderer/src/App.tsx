import React from 'react';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import { TitleBar } from './components/TitleBar/TitleBar';
import { SideBarLayout, SideBarLayoutItem } from './components/SideBarLayout/SideBarLayout';
import { TabManagerProvider, TabManager, useTabManager } from './tabs/TabManager';

import ja from './assets/lang/ja-JP.json';
import en from './assets/lang/en-US.json';

import styles from './App.module.css';

const locale = navigator.language;

function selectMessages(locale: string) {
  switch(locale) {
    case 'en':
      return en;
    case 'ja':
      return ja;
    default:
      return ja;
  }
}

const cache = createIntlCache();
export const intl = createIntl({
  locale,
  defaultLocale: "ja",
  messages: selectMessages(locale)
}, cache);

// タブを開くためのコントロールコンポーネント
const TabControls: React.FC = () => {
  const { addTab } = useTabManager();
  
  const handleOpenPdf = () => {
    // ローカルパスを直接指定してPDFを開く
    addTab({
      label: "Sample PDF",
      type: "pdf",
      props: { 
        src: "/Users/tomokikuchi/Downloads/rishu_final.pdf" 
      }
    });
  };
  
  // 必要に応じて、ダイアログからPDFを選択する関数も追加できます
  const handleSelectPdf = async () => {
    try {
      // ファイル選択ダイアログを表示するには別途実装が必要です
      // (Electronの場合、mainプロセスでdialog.showOpenDialogを実装し、
      // preloadスクリプトで公開する必要があります)
      
      // ここでは例として直接パスを指定します
      addTab({
        label: "別のPDF文書",
        type: "pdf",
        props: { 
          src: "/Users/tomokikuchi/Zotero/storage/JP8TZZU9/Tamašauskaitė と Groth - 2023 - Defining a Knowledge Graph Development Process Through a Systematic Review.pdf" 
        }
      });
    } catch (error) {
      console.error('PDFを開けませんでした:', error);
    }
  };
  
  return (
    <div className={styles.tabControls}>
      <button onClick={handleOpenPdf}>Zotero PDFを開く</button>
      <button onClick={handleSelectPdf}>別のPDFを開く</button>
    </div>
  );
};


// Main App component is now much cleaner
const App: React.FC = () => {
  const titleBarPlaceholder = intl.formatMessage({ id: 'title_bar_placeholder' });

  return (
    <RawIntlProvider value={intl}>
      <TabManagerProvider>
        <div className={styles.main}>
          <SideBarLayout className={styles.layout}>
            <SideBarLayoutItem contentType="left-sidebar" className={styles.sidebar} isClosed={false}>
              <div className={styles.content}>
                <TabControls />
              </div>
            </SideBarLayoutItem>
            <SideBarLayoutItem contentType="content" className={styles.content} isClosed={false}>
              <div className={styles.mainContent}>
                <TitleBar title={titleBarPlaceholder} />
                <TabManager />
              </div>
            </SideBarLayoutItem>
            <SideBarLayoutItem contentType="right-sidebar" className={styles.sidebar} isClosed={true}>
              <div className={styles.content}>
                Settings and Info
              </div>
            </SideBarLayoutItem>
          </SideBarLayout>
        </div>
      </TabManagerProvider>
    </RawIntlProvider>
  );
};

export default App;