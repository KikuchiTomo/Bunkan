import React, { JSX, useState } from 'react';
import { createIntl, createIntlCache, RawIntlProvider, FormattedMessage, FormattedNumber } from 'react-intl'
import { Tab, TabItem } from './components/Tab/Tab';
import { TitleBar } from './components/TitleBar/TitleBar';
import { SideBarLayout, SideBarLayoutItem } from './components/SideBarLayout/SideBarLayout';
import classNames from 'classnames';

import ja from './assets/lang/ja-JP.json';
import en from './assets/lang/en-US.json';

import styles from './App.module.css';

const locale = navigator.language;

function selectMessages(locale: string) {
  switch(locale) {
    case 'en':
      return en
    case 'ja':
      return ja
    default:
      return ja
  }
}

const cache = createIntlCache()
export const intl = createIntl({
  locale,
  defaultLocale: "ja",
  messages: selectMessages(locale)
}, cache)

type TabContentProps = {
  key: string | number;
  label: string | JSX.Element;
};

const App: React.FC = () => {
  // const intl = useIntl();
  const titleBarPlaceholder = intl.formatMessage({ id: 'title_bar_placeholder' })
  
  // State to keep track of tabs
  const [tabs, setTabs] = useState<TabContentProps[]>([
    { key: "tab", label: "Sample PDF" },
    { key: "tab2", label: "A Review of fucking your research" },
    { key: "tab3", label: "A Review of fucking your research ww" },
    { key: "tab4", label: "A Review of fucking your research ssssss" },
  ]);
  
  // Handle tab close
  const handleTabClose = (tabKey: string | number) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.key !== tabKey));
  };

  return (
    <RawIntlProvider value={intl}>
      <div className={styles.main}>
        <SideBarLayout className={styles.layout}>
          <SideBarLayoutItem contentType="left-sidebar" className={styles.sidebar} isClosed={false}>
            <div className={styles.content}>
              aaa
            </div>
          </SideBarLayoutItem>
          <SideBarLayoutItem contentType="content" className={styles.content} isClosed={false}>
            <div className={styles.content}>
              <TitleBar title={titleBarPlaceholder} />
              
              {tabs.length > 0 ? (
                <Tab 
                  defaultKey={tabs[0].key} 
                  onTabClose={handleTabClose}
                >
                  {tabs.map(tab => (
                    <TabItem 
                      key={tab.key} 
                      tabKey={tab.key} 
                      label={tab.label}
                    >
                      Content for {tab.label}
                    </TabItem>
                  ))}
                </Tab>
              ) : (
                <div className={styles.noTabs}>
                  No tabs available
                </div>
              )}
              
              Hello
            </div>
          </SideBarLayoutItem>
          <SideBarLayoutItem contentType="right-sidebar" className={styles.sidebar} isClosed={true}>
            <div className={styles.content}>
              dddd
            </div>
          </SideBarLayoutItem>
        </SideBarLayout>
      </div>
    </RawIntlProvider>
  );
};

export default App;