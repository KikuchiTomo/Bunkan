import classNames from "classnames";
import {
  createContext,
  FC,
  ReactNode,
  useMemo,
  useState,
  useContext,
  ReactElement,
  JSX,
  useCallback,
} from "react";

import styles from "./Tab.module.css";
import '@fontsource-variable/inter';

type TabKey = string | number;
type TabLabel = string | number | JSX.Element;

type TabProps = {
  defaultKey: TabKey;
  children: ReactElement<TabItemProps> | ReactElement<TabItemProps>[];
  className?: string;
  onTabClose?: (tabKey: TabKey) => void;
};

type TabHeader = {
  tabKey: TabKey;
  label: TabLabel;
};

type TabContextState = {
  activeKey: TabKey;
};

const TabContext = createContext<TabContextState>({
  activeKey: "",
});

export const Tab: FC<TabProps> = ({ defaultKey, children, className, onTabClose }) => {
  const [activeKey, setActiveKey] = useState(defaultKey);
  const [tabs, setTabs] = useState<TabHeader[]>([]);
  const [draggedTab, setDraggedTab] = useState<TabKey | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<TabKey | null>(null);
  const [dropPosition, setDropPosition] = useState<'left' | 'right' | null>(null);

  // Extract tab headers from children
  useMemo(() => {
    const headerArray: TabHeader[] = [];
    if (Array.isArray(children)) {
      children.forEach((c) => {
        if (c.type !== TabItem) throw Error("TabItemを利用してください");
        headerArray.push({
          tabKey: c.props.tabKey,
          label: c.props.label,
        });
      });
    } else if (children.type === TabItem) {
      headerArray.push({
        tabKey: children.props.tabKey,
        label: children.props.label,
      });
    } else {
      throw Error("TabItemを利用してください");
    }
    setTabs(headerArray);
  }, [children]);

  // Handle tab close
  const handleTabClose = useCallback((e: React.MouseEvent, tabKey: TabKey) => {
    e.stopPropagation();

    // Find next active key if the closed tab is active
    if (activeKey === tabKey) {
      const tabIndex = tabs.findIndex(tab => tab.tabKey === tabKey);
      if (tabIndex > 0) {
        setActiveKey(tabs[tabIndex - 1].tabKey);
      } else if (tabs.length > 1) {
        setActiveKey(tabs[1].tabKey);
      }
    }

    // Call the onTabClose callback if provided
    if (onTabClose) {
      onTabClose(tabKey);
    }
  }, [activeKey, tabs, onTabClose]);

  // Drag and drop handlers
  const handleDragStart = (tabKey: TabKey) => {
    setDraggedTab(tabKey);
  };

  const handleDragOver = (e: React.DragEvent, tabKey: TabKey) => {
    e.preventDefault();
    if (draggedTab !== null && draggedTab !== tabKey) {
      setDropTargetKey(tabKey);
      
      // マウスの位置を取得してタブの左半分か右半分かを判断
      const tabElement = e.currentTarget as HTMLElement;
      const tabRect = tabElement.getBoundingClientRect();
      const mouseX = e.clientX;
      
      // タブの中心より左側にマウスがあれば'left'、そうでなければ'right'
      const isLeftHalf = mouseX < (tabRect.left + tabRect.width / 2);
      setDropPosition(isLeftHalf ? 'left' : 'right');
    }
  };

  const handleDragLeave = () => {
    setDropTargetKey(null);
    setDropPosition(null);
  };

  const handleDrop = (targetTabKey: TabKey) => {
    setDropTargetKey(null); // ドロップ時にドロップターゲットをクリア
    setDropPosition(null);

    if (draggedTab === null || draggedTab === targetTabKey) {
      setDraggedTab(null);
      return;
    }

    const newTabs = [...tabs];
    const draggedTabIndex = newTabs.findIndex(tab => tab.tabKey === draggedTab);
    const targetTabIndex = newTabs.findIndex(tab => tab.tabKey === targetTabKey);

    if (draggedTabIndex !== -1 && targetTabIndex !== -1) {
      // Remove dragged tab
      const [draggedTabItem] = newTabs.splice(draggedTabIndex, 1);
      // Insert at target position
      newTabs.splice(targetTabIndex, 0, draggedTabItem);
      setTabs(newTabs);
    }

    setDraggedTab(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDropPosition(null);
    setDropTargetKey(null); // ドラッグ終了時にドロップターゲットをクリア
  };

  return (
    <TabContext.Provider value={{ activeKey }}>
      <ul className={classNames(styles.header, className)}>
        {tabs.map(({ tabKey, label }) => {
          return (
            <li
              className={classNames(
                styles.column,
                draggedTab === tabKey && styles.dragging,
                dropTargetKey === tabKey && dropPosition === 'left' && styles.dropLeft,
                dropTargetKey === tabKey && dropPosition === 'right' && styles.dropRight
              )}
              key={tabKey}
              draggable
              onDragStart={() => handleDragStart(tabKey)}
              onDragOver={(e) => handleDragOver(e, tabKey)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(tabKey)}
              onDragEnd={handleDragEnd}
            >
              <button
                className={classNames(
                  styles.button,
                  tabKey === activeKey && styles.active
                )}
                onClick={() => setActiveKey(tabKey)}
              >
                <div className={styles.label}>
                  {label}
                </div>

                <span
                  className={styles.closeButton}
                  onClick={(e) => handleTabClose(e, tabKey)}
                >
                  ✕
                </span>
              </button>
            </li>
          );

        })}
      </ul>
      {children}
    </TabContext.Provider>
  );
};

type TabItemProps = {
  tabKey: TabKey;
  label: TabLabel;
  children: ReactNode;
  className?: string;
};

export const TabItem: FC<TabItemProps> = ({ tabKey, children, className }) => {
  const { activeKey } = useContext(TabContext);

  return activeKey === tabKey ? (
    <div className={classNames(styles.tabBody, className)}>{children}</div>
  ) : null;
};