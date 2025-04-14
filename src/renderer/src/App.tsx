import React from 'react';
import { Tab, TabItem } from './components/Tab/Tab';
import { TitleBar } from './components/TitleBar/TitleBar';
import { SideBarLayout, SideBarLayoutItem } from './components/SideBarLayout/SideBarLayout';
import classNames from 'classnames';
import styles from './App.module.css';

// https://codesandbox.io/p/sandbox/react-resizable-sidebar-kz9de?file=%2Fsrc%2FApp.js
const App: React.FC = () => {
  return <>

    <div className={styles.main}>
      <SideBarLayout className={styles.layout}>
        <SideBarLayoutItem contentType="left-sidebar" className={styles.sidebar} isClosed={false}>
          <div className={styles.content}>
            aaa
          </div>
        </SideBarLayoutItem>
        <SideBarLayoutItem contentType="content" className={styles.content} isClosed={false}>
          <div className={styles.content}>
            <TitleBar title="Hello" />       
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
  </>
};

export default App;