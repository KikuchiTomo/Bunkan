import React from 'react';
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

const App: React.FC = () => {
  // const intl = useIntl();
  const titleBarPlaceholder = intl.formatMessage({ id: 'title_bar_placeholder' })

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
              <Tab defaultKey="tab">
                <TabItem tabKey="tab" label="Sample PDF">     
                  Content #1
                </TabItem>
                <TabItem tabKey="tab2" label="A Review of fucking your research">
                  Content #2
                </TabItem>
                <TabItem tabKey="tab3" label="A Review of fucking your research ww">
                  Content #3
                </TabItem>
                <TabItem tabKey="tab4" label="A Review of fucking your research ssssss">
                  Content #4
                </TabItem>
              </Tab>
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