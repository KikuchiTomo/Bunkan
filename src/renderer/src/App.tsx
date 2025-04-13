import React from 'react';
import { Tab, TabItem } from './components/Tab/Tab';
import { TitleBar } from './components/TitleBar/TitleBar';
import classNames from 'classnames';
import styles from './App.module.css';

const App: React.FC = () => {
  return <div className={styles.main}>
    <TitleBar title="My Application" />
    <Tab defaultKey="tab1">
      <TabItem tabKey="tab1" label="Tab 1">
        <div>Content for Tab 1</div>
      </TabItem>
      <TabItem tabKey="tab2" label="Tab 2">
        <div>Content for Tab 2</div>
      </TabItem>
      <TabItem tabKey="tab3" label="Tab 3">
        <Tab defaultKey="tab3-1">
          <TabItem tabKey="tab3-1" label="Tab 3-1">
            <div>Content for Tab 3-1</div>
          </TabItem>
          <TabItem tabKey="tab3-2" label="Tab 3-2">
            <div>Content for Tab 3-2</div>
          </TabItem>
          <TabItem tabKey="tab3-3" label="Tab 3-3">
            <div>Content for Tab 3-3</div>
          </TabItem>

        </Tab>
      </TabItem>
      </Tab>
  </div>;
};

export default App;