import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, JSX } from 'react';
import { Tab, TabItem } from '../components/Tab/Tab';
import ElectronPDFViewer from '../views/PDFViewer';

// Define tab types
export type TabData = {
  key: string;
  label: string | JSX.Element;
  type: 'pdf' | 'custom';
  content?: ReactNode;
  props?: Record<string, any>;
};

// Create context for tab management
type TabContextType = {
  tabs: TabData[];
  activeTabKey: string | null;
  addTab: (tab: Omit<TabData, 'key'>) => string;
  closeTab: (tabKey: string) => void;
  selectTab: (tabKey: string) => void;
};

const TabContext = createContext<TabContextType | null>(null);

export const useTabManager = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabManager must be used within a TabManagerProvider');
  }
  return context;
};

type TabManagerProviderProps = {
  children: ReactNode;
};

export const TabManagerProvider: React.FC<TabManagerProviderProps> = ({ children }) => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);

  // Add a new tab and generate a unique key
  const addTab = useCallback((tabData: Omit<TabData, 'key'>) => {
    const newTabKey = `tab-${Date.now()}`;
    const newTab = { ...tabData, key: newTabKey };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabKey(newTabKey);
    
    return newTabKey;
  }, []);

  // Close a tab
  const closeTab = useCallback((tabKey: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.key !== tabKey);
      
      // If we're closing the active tab, select another one
      if (activeTabKey === tabKey && newTabs.length > 0) {
        setActiveTabKey(newTabs[0].key);
      } else if (newTabs.length === 0) {
        setActiveTabKey(null);
      }
      
      return newTabs;
    });
  }, [activeTabKey]);

  // Select a tab
  const selectTab = useCallback((tabKey: string) => {
    setActiveTabKey(tabKey);
  }, []);

  const contextValue = useMemo(() => ({
    tabs,
    activeTabKey,
    addTab,
    closeTab,
    selectTab
  }), [tabs, activeTabKey, addTab, closeTab, selectTab]);

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
};

// Individual tab content component (memoized)
const TabContent = React.memo<{ tab: TabData }>(({ tab }) => {
  // このコンポーネントはtab.typeに基づいて異なるコンテンツをレンダリングします
  if (tab.type === 'pdf') {
    // Electronの統合PDFビューワーを使用
    return <ElectronPDFViewer src={tab.props?.src || ''} title={tab.label as string} />;
  } else {
    // カスタムコンテンツをレンダリング
    return <>{tab.content || <div>Content for {tab.label}</div>}</>;
  }
});

// TabManager component
export const TabManager: React.FC = () => {
  const { tabs, activeTabKey, closeTab } = useTabManager();

  if (tabs.length === 0) {
    return <div>タブがありません</div>;
  }

  return (
    <Tab defaultKey={activeTabKey || tabs[0].key} onTabClose={closeTab}>
      {tabs.map(tab => (
        <TabItem key={tab.key} tabKey={tab.key} label={tab.label}>
          <TabContent tab={tab} />
        </TabItem>
      ))}
    </Tab>
  );
};